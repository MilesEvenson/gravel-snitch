import React from 'react';

import ANA from '../data/logos/ANA.png';
import ARI from '../data/logos/ARI.png';
import BOS from '../data/logos/BOS.png';
import BUF from '../data/logos/BUF.png';
import CAR from '../data/logos/CAR.png';
import CBJ from '../data/logos/CBJ.png';
import CGY from '../data/logos/CGY.png';
import CHI from '../data/logos/CHI.png';
import COL from '../data/logos/COL.png';
import DAL from '../data/logos/DAL.png';
import DET from '../data/logos/DET.png';
import EDM from '../data/logos/EDM.png';
import FLA from '../data/logos/FLA.png';
import LAK from '../data/logos/LAK.png';
import MIN from '../data/logos/MIN.png';
import MTL from '../data/logos/MTL.png';
import NJD from '../data/logos/NJD.png';
import NSH from '../data/logos/NSH.png';
import NYI from '../data/logos/NYI.png';
import NYR from '../data/logos/NYR.png';
import OTT from '../data/logos/OTT.png';
import PHI from '../data/logos/PHI.png';
import PIT from '../data/logos/PIT.png';
import SEA from '../data/logos/SEA.png';
import SJS from '../data/logos/SJS.png';
import STL from '../data/logos/STL.png';
import TBL from '../data/logos/TBL.png';
import TOR from '../data/logos/TOR.png';
import VAN from '../data/logos/VAN.png';
import VGK from '../data/logos/VGK.png';
import WPG from '../data/logos/WPG.png';
import WSH from '../data/logos/WSH.png';


export class TeamButton extends React.Component {

  constructor(props) {
    super(props);
  }


  mapSlugToImage(slug) {
    switch (slug) {
      case 'ANA':
        return ANA;
      case 'ARI':
        return ARI;
      case 'BOS':
        return BOS;
      case 'BUF':
        return BUF;
      case 'CAR':
        return CAR;
      case 'CBJ':
        return CBJ;
      case 'CGY':
        return CGY;
      case 'CHI':
        return CHI;
      case 'COL':
        return COL;
      case 'DAL':
        return DAL;
      case 'DET':
        return DET;
      case 'EDM':
        return EDM;
      case 'FLA':
        return FLA;
      case 'LAK':
        return LAK;
      case 'MIN':
        return MIN;
      case 'MTL':
        return MTL;
      case 'NJD':
        return NJD;
      case 'NSH':
        return NSH;
      case 'NYI':
        return NYI;
      case 'NYR':
        return NYR;
      case 'OTT':
        return OTT;
      case 'PHI':
        return PHI;
      case 'PIT':
        return PIT;
      case 'SEA':
        return SEA;
      case 'SJS':
        return SJS;
      case 'STL':
        return STL;
      case 'TBL':
        return TBL;
      case 'TOR':
        return TOR;
      case 'VAN':
        return VAN;
      case 'VGK':
        return VGK;
      case 'WPG':
        return WPG;
      case 'WSH':
        return WSH;
    }
  }


  render() {
    const imagePath = this.mapSlugToImage(this.props.slug);
    const styleWithLogo = {
      backgroundImage: `url(${imagePath})`,
    };
    const buttonClasses = [
      'bg-center',
      'bg-cover',
      'bg-no-repeat',
      'border-2',
      'border-black',
      'h-9',
      'rounded-md',
      'w-9',
    ];

    const divClasses = [
      'bg-center',
      'bg-cover',
      'bg-no-repeat',
      'float-left',
      'h-9',
      'w-9',
    ];

    if (this.props.isActive) {
      return (
        <button
          alt={this.props.slug}
          className={buttonClasses.join(' ')}
          onClick={this.props.clickHandler}
          style={styleWithLogo}
        >
          &nbsp;
        </button>
      );
    }

    return (
      <div
        alt={this.props.slug}
        className={divClasses.join(' ')}
        style={styleWithLogo}
      >
        &nbsp;
      </div>
    );
  }

}
