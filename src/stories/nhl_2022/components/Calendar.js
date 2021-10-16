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

    this.state = {
      countLookaheadGames: 2,
      games: Games,
      lookaheadTree: {},
      parties: Parties,
      rosters: Rosters,
      slugHolder: 'TBL',
      strSeasonStart: '2021-10-14',
      strSeasonEnd: '2022-04-30',
      speculativeTimeline: [],
      teams: Teams,
      zeroWeekDate: new Date('2021-10-11T12:00:00.000-04:00'),
    };
  }


  findNextGameForTeam(strDate, slug) {
    console.log(`Finding next game for ${slug} after ${strDate}`);
    const nextGame = this.state.games.find(g => {
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
    const game = this.state.games.find(g => {
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

  getRowsForCompletedGames(today) {
    let rowDate = new Date();
    rowDate.setTime(this.state.zeroWeekDate.getTime());

    let rowRosters = this.state.rosters[format(rowDate, 'yyyy-MM-dd')];

    const rows = [];

    // TODO:  It would be cool if we rendered the initial Team/Party were dynamically.
    //        This is a looooow priority enhancement.
    rows.push((
      <tr key={format(rowDate, 'yyyy-MM-dd')} style={{background: 'lightgray'}}>
        <td>{format(rowDate, 'MMMM do')}</td>
        <td>{this.state.slugHolder}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    ));

    rowDate = add(rowDate, { days: 1 });

    let gameToday = null;
    let rowStrDate = format(rowDate, 'yyyy-MM-dd');
    let rowHolder = this.state.slugHolder;
    let holderIsHome = false;
    let slugChallenger = '';
    let slugWinner = '';
    let tdKey = '';
    let trKey = '';

    while (rowDate < today) {
      console.log('rowDate:', rowDate);
      rowStrDate = format(rowDate, 'yyyy-MM-dd');

      if (this.state.rosters.hasOwnProperty(rowStrDate)) {
        rowRosters = this.state.rosters[rowStrDate];
      }

      // TODO: replace with a call to findTeamGameOnDate()
      gameToday = this.state.games.find(g => (
        g.gameday === rowStrDate
        && (
          g.slug_home === rowHolder
          || g.slug_away === rowHolder
        )
      ));

      if (gameToday !== undefined) {
        rowHolder = gameToday.slug_winner;
        trKey = `row-${rowStrDate}`;
        rows.push((
          <tr key={tdKey}>
            <td>{format(rowDate, 'MMMM do')}</td>
            {this.state.parties.map(p => {
              tdKey = `${rowStrDate}-${p.name}`;
              let cellValue = '';
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

  getRowsForSpeculativeTimeline(today) {
    const rows = [];
    return rows;
  }

  getRowsForLookahead(startDate) {
    let rowDate = new Date();
    rowDate.setTime(startDate.getTime());
    let gameToday = null;
    let rowStrDate = format(rowDate, 'yyyy-MM-dd');
    let rowHolder = this.state.slugHolder;
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

      if (this.state.rosters.hasOwnProperty(rowStrDate)) {
        rowRosters = this.state.rosters[rowStrDate];
      }

      // TODO: replace with call to findTeamGameOnDate()
      gameToday = this.state.games.find(g => (
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
            {this.state.parties.map(p => {
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
          {this.state.parties.map(p => (<th key={p.name}>{p.name}</th>))}
        </tr>
      </thead>
    );

    const today = new Date();

    const rowsPlayed = this.getRowsForCompletedGames(today);
    const rowsSpeculative = this.getRowsForSpeculativeTimeline(today);
    // TODO: pass the correct date value here (after speculative timeline).
    const lookaheadStart = add(today, { days: rowsSpeculative.length });
    const rowsLookahead = this.getRowsForLookahead(today);

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

