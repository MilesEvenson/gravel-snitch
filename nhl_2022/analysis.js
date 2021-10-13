const Games = require('./games');
const Teams = require('./teams');


function incrementDay(date) {
  const DAY_IN_MILLISECONDS = 86400000;
  const nextDate = new Date();
  nextDate.setTime(DAY_IN_MILLISECONDS + date.getTime());
  return nextDate;
}


function date2String(date) {
  let rawMonth = 1 + date.getMonth();
  let strMonth = `${rawMonth}`;
  if (rawMonth < 10) {
    strMonth  = `0${rawMonth}`;
  }

  let rawDay = date.getDate();
  let strDay = `${rawDay}`;
  if (rawDay < 10) {
    strDay  = `0${rawDay}`;
  }

  return `${date.getFullYear()}-${strMonth}-${strDay}`;
}


function simulateGame(matchup) {
  const rawOutcome = Math.random();
  if (rawOutcome <= matchup.prob_home_win) {
    return matchup.slug_home;
  }
  return matchup.slug_away;
}


function simulateSeason(games, teams, simulationStartDate) {
  const START_OF_SEASON = '2021-10-12';
  const END_OF_SEASON = '2022-04-30';

  let holder = 'TBL';

  let snitchData = {
    [holder]: 0,
  };

  let today = new Date();
  today.setTime(simulationStartDate.getTime());
  let strToday = date2String(today);

  let gameToday = null;
  let holderIsHome = false;
  let slugChallenger = '';
  let slugWinner = '';

  while (strToday < END_OF_SEASON) {
    //console.log(`checking for games on ${strToday}`);

    gameToday = games.find(g => (
      g.gameday === strToday
      && (
        g.slug_away === holder
        || g.slug_home === holder
      )
    ));

    if (gameToday !== undefined) {
      holderIsHome = gameToday.slug_home === holder;
      slugChallenger = holderIsHome ? gameToday.slug_away : gameToday.slug_home;
      //console.log(`  Holder (${holder}) plays ${slugChallenger}`);
      slugWinner = simulateGame(gameToday);
      //console.log(`    Winner: ${slugWinner}`);
      if (slugWinner === slugChallenger) {
        holder = slugChallenger;
        if (!snitchData.hasOwnProperty(holder)) {
          snitchData[holder] = 0;
        }
      }
      snitchData[holder]++;
    }

    today = incrementDay(today);
    strToday = date2String(today);
  }

  return snitchData;
}


function simulateMultipleSeasons(Games, Teams, totalIterations) {
  const today = new Date('2021-10-11T12:00:00.000-04:00');
  today.setHours(12);
  today.setMinutes(0);
  today.setSeconds(0);

  let aggregateResults = {};
  let seasonResults = {};

  for (let i = 0; i < totalIterations; i++) {
    seasonResults = simulateSeason(Games, Teams, today);
    Object.keys(seasonResults).forEach(slug => {
      if (!aggregateResults.hasOwnProperty(slug)) {
        aggregateResults[slug] = 0;
      }
      aggregateResults[slug] += seasonResults[slug];
    });
  }

  return aggregateResults;
}


function main() {
  const aggregateResults = simulateMultipleSeasons(Games, Teams, 10000);

  const sortedKeys = Object.keys(aggregateResults);
  sortedKeys.sort((a, b) => {
    if (aggregateResults[a] < aggregateResults[b]) {
      return -1;
    } else if (aggregateResults[a] > aggregateResults[b]) {
      return 1;
    }
    return 0;
  });

  sortedKeys.forEach(slug => console.log(`${Teams[slug].location} ${Teams[slug].name}: ${aggregateResults[slug]}`));
}


main();

