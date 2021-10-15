import csv
import json



if __name__ == '__main__':
    dicts_games = []
    with open('nhl_elo_latest.original.csv') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            dicts_games.append({
                'gameday': row['date'],
                'slug_home': row['home_team_abbr'],
                'slug_away': row['away_team_abbr'],
                'prob_home_win': float(row['home_team_winprob']),
                'prob_away_win': float(row['away_team_winprob']),
            })

    with open('games.json', 'w') as fp:
        json.dump(dicts_games, fp)
            

