import add from 'date-fns/add';
import format from 'date-fns/format';
import React from 'react';


const Games = require('../data/games');
const Parties = require('../data/parties');
const Rosters = require('../data/rosters');
const Teams = require('../data/teams');


export class Calendar extends React.Component {

  constructor(props) {
    super(props);

    const today = new Date();
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    const zeroWeekDate = new Date('2021-10-11T12:00:00.000-04:00');

    const completedGames = this.processCompletedGames(zeroWeekDate, today);

    const slugHolder = completedGames[completedGames.length - 1].slugHolder;

    this.state = {
      completedGames: completedGames,
      countLookaheadGames: 2,
      lookaheadTree: {},
      slugHolder: slugHolder,
      slugInitalHolder: 'TBL',
      strSeasonStart: '2021-10-14',
      strSeasonEnd: '2022-04-30',
      speculativeTimeline: [],
      today: today,
      zeroWeekDate: zeroWeekDate,
    };
  }


  processCompletedGames(zeroWeekDate, today) {
    let rowDate = new Date();
    rowDate.setTime(zeroWeekDate.getTime());
    let rowStrDate = format(rowDate, 'yyyy-MM-dd');

    // Initialize the calendar rows with the zero week state.
    const games = [
      {
        gameDate: rowDate,
        partyName: 'Erik',
        slugHolder: 'TBL',
      },
    ];

    rowDate = add(rowDate, { days: 1 });

    let gameForRow = null;
    let holderIsHome = false;
    let rowHolder = 'TBL';
    let rowParty = {};
    let rowRosters = Rosters[rowStrDate];
    let slugChallenger = '';
    let tdKey = '';
    let trKey = '';

    while (rowDate < today) {
      rowStrDate = format(rowDate, 'yyyy-MM-dd');

      if (Rosters.hasOwnProperty(rowStrDate)) {
        rowRosters = Rosters[rowStrDate];
      }

      gameForRow = this.findTeamGameOnDate(rowDate, rowHolder);

      if (gameForRow !== undefined) {
        rowHolder = gameForRow.slug_winner;
        rowParty = Parties.find(p =>  (
          rowRosters[p.name].includes(rowHolder)
        ));
        games.push({
          gameDate: rowDate,
          partyName: rowParty.name,
          slugHolder: rowHolder,
        });
      }

      rowDate = add(rowDate, { days: 1 });
    }

    console.log('preprocessing generated records:', games);

    return games;
  }


  findNextGameForTeam(strDate, slug) {
    console.log(`Finding next game for ${slug} after ${strDate}`);
    const nextGame = Games.find(g => {
      return (
        strDate < g.gameday
        && (
          g.slug_home === slug
          || g.slug_away === slug
        )
      );
    });
    if (nextGame) {
      console.log(`Found game`, nextGame);
    } else {
      console.log(`${slug} does not have a game after ${strDate}`);
    }
    return nextGame;
  }

  findTeamGameOnDate(targetDate, slug) {
    const strDate = format(targetDate, 'yyyy-MM-dd');
    console.log(`Finding game for ${slug} on ${strDate}`);
    const game = Games.find(g => {
      return (
        strDate === g.gameday
        && (
          g.slug_home === slug
          || g.slug_away === slug
        )
      );
    });
    if (game) {
      console.log(`Found game`, game);
    } else {
      console.log(`${slug} does not have a game on ${strDate}`);
    }
    return game;
  }

  buildRowsForCompletedGames() {
    const rows = this.state.completedGames.map(g => {
      const rowStrDate = format(g.gameDate, 'yyyy-MM-dd');
      const trKey = `calendar-row-${rowStrDate}`;
      return (
        <tr key={trKey}>
          <td>{rowStrDate}</td>
          {Parties.map(p => {
            const tdKey = `calendar-cell-${rowStrDate}-${p.name}`;
            let cellValue = '';
            if (p.name === g.partyName) {
              cellValue = g.slugHolder;
            }
            return (<td key={tdKey}>{cellValue}</td>);
          })}
        </tr>
      );
    });
    return rows;
  }

  buildRowsForSpeculativeTimeline(today) {
    const rows = [];
    return rows;
  }

  getRowsForLookahead(startDate) {
    let rowDate = new Date();
    rowDate.setTime(startDate.getTime());
    let gameToday = null;
    let rowStrDate = format(rowDate, 'yyyy-MM-dd');
    let rowHolder = this.state.slugInitalHolder;
    let holderIsHome = false;
    let slugChallenger = '';
    let slugWinner = '';
    let tdKey = '';
    let trKey = '';

    console.log(`Looking ahead ${this.state.countLookaheadGames} games from ${rowStrDate}`);

    // TODO: replace with call to findTeamGameOnDate()

    const lookaheadGames = {};

    let qGame = this.findTeamGameOnDate(rowDate, rowHolder);
    console.log('found game', qGame);
    let key = '';
    let qNode = {};
    const queue = [
      {
        generation: 0,
        game: qGame,
      }
    ];
    while (0 < queue.length) {
      qNode = queue.shift();
      console.dir(qNode, { dept: null });

      key = `${qNode.game.gameday}-${qNode.game.slug_home}-${qNode.game.slug_away}`;
      lookaheadGames[key] = qNode.game;

      if (qNode.generation <= this.state.countLookaheadGames) {
        qGame = this.findNextGameForTeam(qNode.game.gameday, qNode.game.slug_home);
        queue.push({
          generation: 1 + qNode,
          game: qGame,
        });
        qGame = this.findNextGameForTeam(qNode.game.gameday, qNode.game.slug_away);
        queue.push({
          generation: 1 + qNode,
          game: qGame,
        });
      }
    }

    console.log('Built dictionary of lookahead games:');
    console.dir(lookaheadGames, { depth: null });

    const rows = [];

    while (rowDate < this.state.strSeasonEnd) {
      console.log('rowDate:', rowDate);
      rowStrDate = format(rowDate, 'yyyy-MM-dd');

      if (rosters.hasOwnProperty(rowStrDate)) {
        rowRosters = rosters[rowStrDate];
      }

      // TODO: replace with call to findTeamGameOnDate()
      gameToday = Games.find(g => (
        g.gameday === rowStrDate
        && (
          g.slug_away === rowHolder
          || g.slug_home === rowHolder
        )
      ));

      if (gameToday !== undefined) {
        rowHolder = gameToday.slug_winner;
        trKey = `row-${rowStrDate}`;
        rows.push((
          <tr key={tdKey}>
            <td>{format(rowDate, 'MMMM do')}</td>
            {Parties.map(p => {
              tdKey = `${rowStrDate}-${p.name}`;
              const cellValue = '';
              if (rowRosters[p.name].includes(gameToday.slug_winner)) {
                cellValue = gameToday.slug_winner;
              }

              return (
                <td key={tdKey}>{cellValue}</td>
              );
            })}
          </tr>
        ));
      }

      rowDate = add(rowDate, { days: 1 });
    }

    return rows;
  }

  render() {
    const header = (
      <thead>
        <tr>
          <th></th>
          {Parties.map(p => (<th key={p.name}>{p.name}</th>))}
        </tr>
      </thead>
    );

    const rowsPlayed = this.buildRowsForCompletedGames();
    const rowsSpeculative = this.buildRowsForSpeculativeTimeline(this.state.today);

    //const lookaheadStart = add(this.state.today, { days: rowsSpeculative.length });
    //const rowsLookahead = this.getRowsForLookahead(lookaheadStart);

    return (
      <table>
        {header}

        <tbody>
          {rowsPlayed}
          {rowsSpeculative}
        </tbody>
      </table>
    );
  }

}

