import add from 'date-fns/add';
import format from 'date-fns/format';
import parse from 'date-fns/parse'
import React from 'react';


import { CalendarCell } from './CalendarCell';


const Games = require('../data/games');
const Parties = require('../data/parties');
const Rosters = require('../data/rosters');
const Teams = require('../data/teams');


export class Calendar extends React.Component {

  constructor(props) {
    super(props);

    const today = new Date();
    // Zero hours/mins/secs to make comparisons easier to work with.
    today.setHours(0);
    today.setMinutes(0);
    today.setSeconds(0);
    const zeroWeekDate = new Date('2021-10-11T12:00:00.000-04:00');

    const completedGames = this.processCompletedGames(zeroWeekDate, today);

    const slugHolder = completedGames[completedGames.length - 1].slugHolder;

    this.state = {
      completedGames: completedGames,
      countLookaheadGames: 1,
      lookaheadTree: {},
      slugHolder: slugHolder,
      slugInitalHolder: 'TBL',
      strSeasonStart: '2021-10-14',
      strSeasonEnd: '2022-04-30',
      speculativeTimeline: [],
      today: today,
      zeroWeekDate: zeroWeekDate,
      zeroWeekGame: {
        gameDate: zeroWeekDate,
        partyName: 'Erik',
        slugHolder: 'TBL',
      },
    };


    this.addGameToSpeculativeTimeline = this.addGameToSpeculativeTimeline.bind(this);
  }


  processCompletedGames(zeroWeekDate, today) {
    let rowDate = new Date();
    rowDate.setTime(zeroWeekDate.getTime());
    let rowStrDate = format(rowDate, 'yyyy-MM-dd');

    const games = [];

    rowDate = add(rowDate, { days: 1 });

    let gameForRow = null;
    let holderIsHome = false;
    let rowHolder = 'TBL';
    let rowParty = {};
    let rowRosters = Rosters[rowStrDate];
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

    return games;
  }


  addGameToSpeculativeTimeline(slug, strGameday) {
    this.setState({
      slugHolder: slug,
      speculativeTimeline: [
        ...this.state.speculativeTimeline,
        {
          gameDate: parse(strGameday, 'yyyy-MM-dd', new Date()),
          slugHolder: slug,
        },
      ],
    });
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
      console.log(`Found next game`, nextGame);
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
      console.log(`Found target game`, game);
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
          <td>{format(g.gameDate, 'MMMM do')}</td>
          {Parties.map(p => {
            const slugs = [];
            if (p.name === g.partyName) {
              slugs.push(g.slugHolder);
            }
            return (
              <CalendarCell
                cellType="completed"
                key={`calendar-cell-${rowStrDate}-${p.name}`}
                slugs={slugs}
              />
            );
          })}
        </tr>
      );
    });
    return rows;
  }

  buildRowsForSpeculativeTimeline(today) {
    const rostersForSpeculation = Object.values(Rosters).pop();
    const rows = this.state.speculativeTimeline.map(sg => {
      const rowStrDate = format(sg.gameDate, 'yyyy-MM-dd');
      const trKey = `calendar-row-${rowStrDate}`;
      return (
        <tr key={trKey}>
          <td>{format(sg.gameDate, 'MMMM do')}</td>
          {Parties.map(p => {
            const slugs = [];
            if (rostersForSpeculation[p.name].includes(sg.slugHolder)) {
              slugs.push(sg.slugHolder);
            }
            // TODO: add click handler for removing this game from speculative timeline
            return (
              <CalendarCell
                cellType="speculative"
                key={`calendar-cell-${rowStrDate}-${p.name}`}
                slugs={slugs}
              />
            );
          })}
        </tr>
      );
    });
    return rows;
  }

  getRowsForLookahead(today) {
    let startDate = new Date();
    startDate.setTime(today.getTime());
    if (0 < this.state.speculativeTimeline.length) {
      const [ preLookaheadGame ] = this.state.speculativeTimeline.slice(-1);
      startDate = add(preLookaheadGame.gameDate, { days: 1 });
    }

    let rowHolder = this.state.slugHolder;

    const lookaheadGames = {};

    let qGame = this.findNextGameForTeam(format(startDate, 'yyyy-MM-dd'), rowHolder);
    let qMatchup = '';
    let qNode = {};
    const queue = [
      {
        generation: 0,
        game: qGame,
      },
    ];
    while (0 < queue.length) {
      qNode = queue.shift();

      let qMatchup = `${qNode.game.slug_home}-${qNode.game.slug_away}`;
      if (!lookaheadGames.hasOwnProperty(qNode.game.gameday)) {
        lookaheadGames[qNode.game.gameday] = {};
      }
      lookaheadGames[qNode.game.gameday][qMatchup] = qNode.game;

      if (qNode.generation < this.state.countLookaheadGames) {
        qGame = this.findNextGameForTeam(qNode.game.gameday, qNode.game.slug_home);
        queue.push({
          generation: 1 + qNode.generation,
          game: qGame,
        });
        qGame = this.findNextGameForTeam(qNode.game.gameday, qNode.game.slug_away);
        queue.push({
          generation: 1 + qNode.generation,
          game: qGame,
        });
      }
    }

    console.log('Built dictionary of lookahead games:');
    console.dir(lookaheadGames, { depth: null });

    // TODO: consider breaking getRowsForLookahead() into two methods here.


    let gameToday = null;
    let holderIsHome = false;
    let slugWinner = '';
    let trKey = '';
    // Assume future rosters will remain static.
    const rowRosters = Object.values(Rosters).pop();

    const lookaheadStrDates = Object.keys(lookaheadGames);
    lookaheadStrDates.sort();
    const rows = lookaheadStrDates.map(rowStrDate => {
      const rowDate = parse(rowStrDate, 'yyyy-MM-dd', new Date());
      const cells = Parties.map(p => {
        const partyTeams = Object.values(lookaheadGames[rowStrDate]).reduce(
          (list, game) => {
            if (rowRosters[p.name].includes(game.slug_home)) {
              list.push(game.slug_home);
            }
            if (rowRosters[p.name].includes(game.slug_away)) {
              list.push(game.slug_away);
            }
            return list;
          },
          []
        );

        return (
          <CalendarCell
            cellType="lookahead"
            clickHandler={this.addGameToSpeculativeTimeline}
            key={`calendar-cell-${rowStrDate}-${p.name}`}
            slugs={partyTeams}
            strDate={rowStrDate}
          />
        );
      });

      return (
        <tr key={`calendar-${rowStrDate}`}>
          <td>{format(rowDate, 'MMMM do')}</td>
          {cells}
        </tr>
      );

    });

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

    // TODO: consider writing this.buildRowForZeroWeekGame() to encapsulate this logic.
    const rowForZeroWeek = (
      <tr style={{background: 'lightgray'}}>
        <td>{format(this.state.zeroWeekDate, 'MMMM do')}</td>
        <CalendarCell slugs={['TBL']} />
        <CalendarCell slugs={[]} />
        <CalendarCell slugs={[]} />
        <CalendarCell slugs={[]} />
        <CalendarCell slugs={[]} />
        <CalendarCell slugs={[]} />
        <CalendarCell slugs={[]} />
      </tr>
    );
    const rowsPlayed = this.buildRowsForCompletedGames();
    const rowsSpeculative = this.buildRowsForSpeculativeTimeline(this.state.today);

    const rowsLookahead = this.getRowsForLookahead(this.state.today);

    return (
      <table>
        {header}

        <tbody>
          {rowForZeroWeek}
          {rowsPlayed}
          {rowsSpeculative}
          {rowsLookahead}
        </tbody>
      </table>
    );
  }

}

