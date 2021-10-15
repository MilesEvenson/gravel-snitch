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
    let holder = this.state.slugHolder;
    let holderIsHome = false;
    let slugChallenger = '';
    let slugWinner = '';

    while (rowDate < today) {
      if (this.state.rosters.hasOwnProperty(format(rowDate, 'yyyy-MM-dd'))) {
        rowRosters = this.state.rosters[format(rowDate, 'yyyy-MM-dd')];
      }

      gameToday = this.state.games.find(g => (
        g.gameday === format(rowDate, 'yyyy-MM-dd')
        && (
          g.slug_away === holder
          || g.slug_home === holder
        )
      ));

      if (gameToday !== undefined) {
        holder = gameToday.slug_winner;
        rows.push((
          <tr key={format(rowDate, 'yyyy-MM-dd')}>
            <td>{format(rowDate, 'MMMM do')}</td>
            {this.state.parties.map(p => {
              let cellValue = '';
              if (rowRosters[p.name].includes(gameToday.slug_winner)) {
                cellValue = gameToday.slug_winner;
              }
              else { console.log(`${p.name} no own ${gameToday.slug_winner}`); }
              return (
                <td key={`${format(rowDate, 'yyyy-MM-dd')}-${p.name}`}>
                  {cellValue}
                </td>
              );
            })}
          </tr>
        ));
      }

      rowDate = add(rowDate, { days: 1 });
      console.log('rowDate:', rowDate);
    }

    return rows;
  }

  getRowsForSpeculativeTimeline(today) {
    return [];
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

