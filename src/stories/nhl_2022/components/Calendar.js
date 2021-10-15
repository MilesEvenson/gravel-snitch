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
      games: Games,
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

  getRowsForCompletedGames(today) {
    let rowDate = new Date();
    rowDate.setTime(this.state.zeroWeekDate.getTime());

    let rowRosters = this.state.rosters[format(rowDate, 'yyyy-MM-dd')];

    const rows = [];

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
              console.log(`processing party ${p.name}`);
              tdKey = rowStrDate + '-' + p.name;
              console.log('tdKey:', tdKey);
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
    const lookaheadGames = 2;
    let rowDate = new Date();
    rowDate.setTime(startDate.getTime());
    let rowStrDate = format(rowDate, 'yyyy-MM-dd');

    console.log(`Looking ahead ${lookaheadGames} games from ${rowStrDate}`);

    // Looking 2 outcomes ahead will yield up to 4 holders.
    // Data structure for both generations?

    const rows = [];

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

