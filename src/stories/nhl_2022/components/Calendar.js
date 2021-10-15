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
      speculativeTimeline: [],
      teams: Teams,
    };
  }

  render() {
    const header = (
      <thead>
        <tr>
          {this.state.parties.map(p => (<th>{p.name}</th>))}
        </tr>
      </thead>
    );
    const rows = [];

    return (
      <table>
        {header}

      </table>
    );
  }

}

