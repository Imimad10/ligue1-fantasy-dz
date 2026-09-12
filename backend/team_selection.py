import os
from supabase import create_client, Client

# Initialisation du client Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Clé service_role recommandée pour un backend afin de contourner le RLS

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_fantasy_team(user_id: str, team_name: str, player_ids: list, gameweek_id: int) -> dict:
    """
    Logique pour composer une équipe de 15 joueurs en respectant le budget.
    """
    if len(player_ids) != 15:
        return {"error": "L'équipe doit contenir exactement 15 joueurs."}

    # 1. Récupérer les informations des joueurs sélectionnés
    response = supabase.table("players").select("id, position, price").in_("id", player_ids).execute()
    players = response.data

    if len(players) != 15:
        return {"error": "Un ou plusieurs joueurs sont invalides."}

    # 2. Vérifier les contraintes de positions (Optionnel mais standard en Fantasy: 2 GK, 5 DEF, 5 MID, 3 FWD)
    positions = {"GK": 0, "DEF": 0, "MID": 0, "FWD": 0}
    total_price = 0.0

    for p in players:
        positions[p["position"]] += 1
        total_price += p["price"]

    if positions["GK"] != 2 or positions["DEF"] != 5 or positions["MID"] != 5 or positions["FWD"] != 3:
        return {"error": "Formation invalide. Requis: 2 GK, 5 DEF, 5 MID, 3 FWD."}

    # 3. Vérifier le budget (Maximum 100.0)
    max_budget = 100.0
    if total_price > max_budget:
        return {"error": f"Budget dépassé! Prix total: {total_price}M (Max: {max_budget}M)."}

    # 4. Insérer l'équipe dans la base de données
    try:
        # Création de l'équipe
        team_data = {
            "user_id": user_id,
            "name": team_name,
            "budget": max_budget - total_price # Budget restant
        }
        team_response = supabase.table("fantasy_teams").insert(team_data).execute()
        fantasy_team_id = team_response.data[0]["id"]

        # Préparation des 15 joueurs
        team_players_data = []
        for i, p_id in enumerate(player_ids):
            team_players_data.append({
                "fantasy_team_id": fantasy_team_id,
                "player_id": p_id,
                "gameweek_id": gameweek_id,
                "is_captain": True if i == 0 else False, # Le premier est capitaine par défaut
                "is_starting": True if i < 11 else False # Les 11 premiers sont titulaires
            })

        # Insertion des joueurs
        supabase.table("fantasy_team_players").insert(team_players_data).execute()

        return {
            "success": True,
            "message": "Équipe créée avec succès!",
            "fantasy_team_id": fantasy_team_id,
            "budget_restant": max_budget - total_price
        }

    except Exception as e:
        # Idéalement gérer un rollback manuel si l'insertion des joueurs échoue
        return {"error": f"Erreur lors de la création de l'équipe : {str(e)}"}

# --- Exemple d'utilisation ---
# if __name__ == "__main__":
#     user_uuid = "123e4567-e89b-12d3-a456-426614174000"
#     selected_players = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] 
#     result = create_fantasy_team(user_uuid, "Les Fennecs FC", selected_players, gameweek_id=1)
#     print(result)
