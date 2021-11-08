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
        strDate <= g.gameday
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
      const classNames = [
        'bg-gray-200',
      ];
      return (
        <tr
          className={classNames.join(' ')}
          key={trKey}
        >
          <td
            className="whitespace-nowrap"
          >
            {format(g.gameDate, 'MMMM do')}
          </td>
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
      const classNames = [
        'bg-opacity-30',
        'bg-green-200',
      ];
      return (
        <tr
          className={classNames.join(' ')}
          key={trKey}
        >
          <td
            className="whitespace-nowrap"
          >
            {format(sg.gameDate, 'MMMM do')}
          </td>
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

    let dateAfterGameday = new Date();
    let qGame = this.findNextGameForTeam(format(startDate, 'yyyy-MM-dd'), rowHolder);
    const rootHolder = rowHolder;
    const rootGame = this.findNextGameForTeam(format(startDate, 'yyyy-MM-dd'), rootHolder);
    const rootMatchup = `${rootGame.slug_home}-${rootGame.slug_away}`;
    let challenger = rootGame.slug_away;
    if (rootGame.slug_away === this.state.slugHolder) {
      challenger = rootGame.slug_home;
    }

    // Add the root game of our short lookahead tree.
    lookaheadGames[rootGame.gameday] = {
      games: {
        [rootMatchup]: {
          branches: [],
          game: { ...rootGame },
        },
      },
      generation: 0,
    };

    const dayAfterRootGameday = add(
      parse(rootGame.gameday, 'yyyy-MM-dd', new Date()),
      { days: 1 }
    );
    const strDayAfterRootGameday = format(dayAfterRootGameday, 'yyyy-MM-dd');

    // lookahead to holder's next next game
    const holderNextGame = this.findNextGameForTeam(strDayAfterRootGameday, rootHolder);
    const holderNextMatchup = `${holderNextGame.slug_home}-${holderNextGame.slug_away}`;
    // No need to check for this because we know that
    // rootGame and holderNextGame are different games.
    lookaheadGames[holderNextGame.gameday] = {
      games: {
        [holderNextMatchup]: {
          branches: [ 'blue' ],
          game: { ...holderNextGame },
        },
      },
      generation: 1,
    };

    // lookahead to challenger's next next game
    const challengerNextGame = this.findNextGameForTeam(strDayAfterRootGameday, challenger);
    const challengerNextMatchup = `${challengerNextGame.slug_home}-${challengerNextGame.slug_away}`;
    if (lookaheadGames.hasOwnProperty(challengerNextGame.gameday)) {
      lookaheadGames[challengerNextGame.gameday]['games'][challengerNextMatchup] = {
        branches: [ 'red' ],
        game: { ...challengerNextGame },
      };
    } else {
      lookaheadGames[challengerNextGame.gameday] = {
        games: {
          [challengerNextMatchup]: {
            branches: [ 'red' ],
            game: { ...challengerNextGame },
          },
        },
        generation: 1,
      };
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
      const slugBranchMap = {};
      const cells = Parties.map(p => {
        const partyTeams = Object.keys(lookaheadGames[rowStrDate].games).reduce(
          (list, matchup) => {
            const {
              branches,
              game,
            } = lookaheadGames[rowStrDate].games[matchup];
            // TODO: update this logic to respect challenger/holder
            if (rowRosters[p.name].includes(game.slug_home)) {
              list.push(game.slug_home);
              if (branches && branches.length) {
                slugBranchMap[game.slug_home] = [ ...branches ];
              } else {
                if (game.slug_home === this.state.slugHolder) {
                  slugBranchMap[game.slug_home] = ['blue'];
                } else {
                  slugBranchMap[game.slug_home] = ['red'];
                }
              }
            }
            // TODO: update this logic to respect challenger/holder
            if (rowRosters[p.name].includes(game.slug_away)) {
              list.push(game.slug_away);
              if (branches && branches.length) {
                slugBranchMap[game.slug_away] = [ ...branches ];
              } else {
                if (game.slug_away === this.state.slugHolder) {
                  slugBranchMap[game.slug_away] = ['blue'];
                } else {
                  slugBranchMap[game.slug_away] = ['red'];
                }
              }
            }
            return list;
          },
          []
        );

        return (
          <CalendarCell
            cellType="lookahead"
            clickHandler={this.addGameToSpeculativeTimeline}
            generation={lookaheadGames[rowStrDate].generation}
            key={`calendar-cell-${rowStrDate}-${p.name}`}
            slugBranchMap={slugBranchMap}
            slugs={partyTeams}
            strDate={rowStrDate}
          />
        );
      });

      return (
        <tr key={`calendar-${rowStrDate}`}>
          <td
            className="whitespace-nowrap"
          >
            {format(rowDate, 'MMMM do')}
          </td>
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
          <th className="w-16"></th>
          {Parties.map(p => (
            <th
              className="w-12"
              key={p.name}
            >
              {p.name}
            </th>
          ))}
        </tr>
      </thead>
    );

    // TODO: consider writing this.buildRowForZeroWeekGame() to encapsulate this logic.
    const rowForZeroWeek = (
      <tr className="bg-gray-200 border-t-0 border-r-0 border-b-2 border-l-0 border-black">
        <td
          className="whitespace-nowrap"
        >
          {format(this.state.zeroWeekDate, 'MMMM do')}
        </td>
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
      <div className="container mx-auto">
        <table className="nhl-2022 table-fixed text-left w-full">
          {header}

          <tbody>
            {rowForZeroWeek}
            {rowsPlayed}
            {rowsSpeculative}
            {rowsLookahead}
          </tbody>
        </table>
      </div>
    );
  }

}

