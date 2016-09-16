window.nba = ( function( window ) {
	"use strict";

	var NBA = {},
		CONT = document.querySelector( '.main .container' ),
		TABS = document.querySelector( '.tabs' ),
		CLIENT_ID   = '',
		API_KEY     = 'AIzaSyA-n8PLEMahQMw7ck6edby5CIssqF71f1c',
		SCOPES      = ["https://www.googleapis.com/auth/spreadsheets.readonly"],
		SHEET_ID    = '1fteH6HOqQXmgMnAhhek0W6_BDvVMNlBu25SCCNruYbc', // JK's 2016 NBA LIVE Mobile Workbook
		SHEET_GID   = '724315897',
		SHEET_URL   = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tqx=out:json&gid=' + SHEET_GID,
		STATS_ABBR  = {
			AGL: 'Agility',
			CLT: 'Clutch',
			CND: 'Conditioning',
			COE: 'Closeout Effectiveness',
			CTS: 'Contested Shot',
			CTV: 'Court Vision',
			DBE: 'Defensive Boxout Effectiveness',
			DBS: 'Dribble Speed',
			DDF: 'Drawing Defensive Foul',
			DEF: 'Defense',
			DKR: 'Dunk Rating',
			DLF: 'Dunk vs Layup Frequency',
			DOF: 'Drawing Offensive Foul',
			DPF: 'Defensive Post Footwork',
			DPS: 'Defensive Post Strength',
			DRI: 'Dribbling',
			DRQ: 'Defensive Rebounding IQ',
			DRS: 'Defensive Rebounding Strength',
			DSE: 'Defensive Sink or Swim Effectiveness',
			DTA: 'Double Team Ability',
			DTC: 'Double Team Composure',
			DVG: 'Dribble Off vs Go Away from Pick',
			FBA: 'Fast Break Anticipation',
			FMT: 'Foul Mistakes',
			FSS: 'First Step',
			FTA: 'Free Throw Ability',
			FTS: 'Fight Through Screen',
			GTG: 'Go-To Guy',
			HDF: 'Help Defense',
			HES: 'Hedging the Screen',
			HIP: 'Hands in Post',
			HOP: 'Hands on Perimeter',
			HSE: 'Help Side Effectiveness',
			HST: 'Hustle',
			INT: 'Interception',
			ISA: 'Inside Shooting Ability',
			ISL: 'Inside Shooting Likelihood',
			LDA: 'Layup Dunk Aggressiveness',
			LIT: 'Layup in Traffic',
			MSA: 'Midrange Shooting Ability',
			MSL: 'Midrange Shooting Likelihood',
			MTT: 'Mental Toughness',
			OBE: 'Offensive Boxout Effectiveness',
			OEF: 'On Ball Effectiveness',
			OPF: 'Offensive Post Footwork',
			ORQ: 'Offensive Rebounding IQ',
			ORS: 'Offensive Rebounding Strength',
			OSE: 'Offensive Sink or Swim Effectiveness',
			OSL: 'Outside Shooting Likelihood',
			PAS: 'Passing',
			PEF: 'Penetration Effectiveness',
			PSA: 'Pass Accuracy',
			PST: 'Post Strength',
			PTS: 'Post Savvy',
			PVD: 'Pull Up vs Drive to Basket',
			QKN: 'Quickness',
			SBL: 'Shot Block',
			SHT: 'Shooting',
			SMT: 'Shooters Mentality',
			SPD: 'Speed',
			SSK: 'Shot Streak',
			STA: 'Shot Alter',
			STK: 'Streak',
			STL: 'Steal',
			STR: 'Strength',
			STS: 'Setting Screens',
			STT: 'Shooting Touch',
			SWC: 'Scoring with Contact',
			TEN: 'Tenacity',
			TPT: '3 Pointer',
			TTE: 'Triple Threat Effectiveness',
			VERT: 'Vertical'
		},
		TABLE_MAP = {
			name      : 'A',
			pos       : 'B',
			team      : 'C',
			type      : 'G',
			program   : 'H',
			lineup    : 'I',
			ovr       : 'M',
			spd       : 'N',
			dri       : 'O',
			tpt       : 'P',
			sht       : 'Q',
			def       : 'R',
			pas       : 'S',
		},
		EXC_COOKIE  = 'nbalive_excl_stats',
		COMP_COOKIE = 'nbalive_compare',
		ABILITIES = [
			'SPD', 'DRI', 'TPT', 'SHT', 'DEF', 'PAS'
		];

	NBA.init = function() {

		var nba_cookie = cookie.get( EXC_COOKIE );

		if( !nba_cookie ) {
			cookie.set( EXC_COOKIE, JSON.stringify( {} ) );
		}
		
		NBA.initTabs();
		NBA.addOptionsBox();

		//gapi.client.setApiKey( API_KEY );
		google.charts.load( 'current', { packages: ['table'] } );
		google.charts.setOnLoadCallback( NBA.gInit );
	};
	
	NBA.initTabs = function() {
		var i, len,
			tabnav = document.querySelectorAll( '.tab-nav li a' );

		for( i = 0, len = tabnav.length; i < len; i ++ ) {
			NBA.addEvent( 'click', tabnav[i], NBA.toggleTabNav, false );
		}
	};

	NBA.toggleTabNav = function( evt ) {

		evt.preventDefault();

		var els    = this.parentElement.parentElement.querySelectorAll( 'a' ),
			href   = this.parentElement.getAttribute( 'id' ),
			parent = this.parentElement,
			target = document.getElementById( href.replace( 'tab-nav-', '' ) ),
			i, len, panel;

		for( i = 0, len = els.length; i < len; i++ ) {
			NBA.removeClass( els[i].parentElement, 'active' );
			panel = document.getElementById( els[i].parentElement.getAttribute( 'id' ).replace( 'tab-nav-', '' ) );
			NBA.removeClass( panel, 'active' );
		}

		NBA.addClass( parent, 'active' );
		NBA.addClass( target, 'active' );
	};

	NBA.addOptionsBox = function() {

		var key, 
			ck   = JSON.parse( cookie.get( EXC_COOKIE ) ),
			opts = document.querySelector( '#options .tab-inner #switch' );

		for( key in STATS_ABBR ) {

			var conts = document.createElement( 'div' ),
				check = document.createElement( 'input' ),
				label = document.createElement( 'label' ),
				span1 = document.createElement( 'span' ),
				span2 = document.createElement( 'span' ),
				abbrv = document.createElement( 'abbr' );
				
			label.setAttribute( 'class', 'switch' );
			span1.setAttribute( 'class', 'switch-label' );
			span1.setAttribute( 'data-on', 'SHOW' );
			span1.setAttribute( 'data-off', 'HIDE' );
			span2.setAttribute( 'class', 'switch-handle' );

			check.setAttribute( 'type',  'checkbox' );
			check.setAttribute( 'value', key );
			check.setAttribute( 'name',  'options[]' );
			check.setAttribute( 'class', 'switch-input' );
			
			if( key in ck === false ) {
				check.checked = true;
			}

			conts.setAttribute( 'class', 'switch-box' );

			abbrv.setAttribute( 'title', STATS_ABBR[ key ]);
			abbrv.innerHTML = key;

			NBA.addEvent( 'change', check, NBA.checkOnChange, false );

			label.appendChild( check );
			label.appendChild( span1 );
			label.appendChild( span2 );

			conts.appendChild( abbrv );
			conts.appendChild( label );

			opts.appendChild( conts );
		}

	};

	NBA.checkOnChange = function(evt) {
		var ck  = JSON.parse( cookie.get( EXC_COOKIE ) ),
			val = evt.currentTarget.value;

		if( true === this.checked ) {
			if( val in ck === true ) {
				delete ck[val];
			}
		} else {
			if( val in ck === false ) {
				ck[ val ] = val;
			}
		}

		cookie.set( EXC_COOKIE, JSON.stringify( ck ) );
	};

	NBA.gInit = function() {

		NBA.requestData();
		var form = document.forms.namedItem( 'form' );
		NBA.addEvent( 'submit', form, NBA.processForm, false );
	};

	NBA.processForm = function( evt ) {
		evt.preventDefault();

		var form = new FormData( evt.currentTarget ),
			spin = document.getElementById( 'loader' ),
			wher = false,
			qStr = 'SELECT A, B, C, G, I, M LIMIT 10',
			data = {
				name    : form.get( 'name' ),
				ovr     : [
					form.get( 'ovr_min' ),
					form.get( 'ovr_max' )
				],
				spd     : form.get( 'spd_min' ),
				dri     : form.get( 'dri_min' ),
				tpt     : form.get( 'tpt_min' ),
				sht     : form.get( 'sht_min' ),
				def     : form.get( 'def_min' ),
				pas     : form.get( 'pas_min' ),
				team    : form.get( 'team' ),
				lineup  : form.get( 'lineup' ),
				pos     : form.get( 'pos' ),
				type    : form.get( 'type' ),
				program : form.get( 'program' ),
				orderby : form.get( 'orderby' ),
				order   : form.get( 'order' )
			},
			number = [ 'spd', 'dri', 'tpt', 'sht', 'def', 'pas' ],
			key;

		NBA.removeClass( spin, 'hidden' );

		for( key in data ) {

			if( false === NBA.empty( data[ key ] ) ) {

				if( key === 'order' ) {

					qStr += ' ' + data[ key ];

				} else if( key === 'orderby' ) {

					qStr += ' ORDER BY ' + TABLE_MAP[ data[ key ] ]; 

				} else {

					if( !wher ) {
						qStr +=' WHERE ';
						wher = true;
					} else {
						qStr += ' AND ';
					}

					if( number.indexOf( key ) > -1 ) {

						qStr += TABLE_MAP[ key ] + ' >= ' + data[ key ];

					} else if( key === 'ovr' ) {

						var ovr_min = data[ key ][0] ? data[ key ][0] : 0;
						var ovr_max = data[ key ][1] ? data[ key ][1] : 100;

						qStr += TABLE_MAP.ovr + ' >= ' + ovr_min + ' AND ' + TABLE_MAP.ovr + ' <= ' + ovr_max;

					} else {

						qStr += TABLE_MAP[ key ] + ' CONTAINS "' + data[ key ] + '"';

					}
				}
			}
		}

		NBA.requestData( qStr );
	};


	NBA.requestData = function( qStr = false ) {
		var query = new google.visualization.Query( SHEET_URL );
			qStr  = qStr ? qStr : 'SELECT A, B, C, G, I, M';

		query.setQuery( qStr );
		query.send( NBA.buildResponse );
	}

	NBA.buildResponse = function( response ) {

		if ( response.isError() ) {
			alert( 'Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage() );
			return;
		}
		var data = response.getDataTable(),
			str  = data.toJSON();

		NBA.buildTable( JSON.parse( str ) );
	};

	NBA.buildTable = function( data ) {

		var div, spin, child, key, i, j, lenI, lenJ, className, table, thead, tbody, theadInner = '', tbodyInner = '',
			currentRow;

		table = document.createElement( 'table' );
		table.setAttribute( 'id', 'player-list' );

		thead = document.createElement( 'thead' );
		thead.className = 'player-list-head';

		tbody = document.createElement( 'tbody' );
		tbody.className = 'player-list-body';

		for( key in data.cols ) {
			theadInner += '<td>' + data.cols[ key ].label + '</td>';
		}

		thead.innerHTML = '<tr>' + theadInner + '</tr>';

		for( i = 0, lenI = data.rows.length; i < lenI; i++ ) {

			tbodyInner += '<tr>';

			for( j = 0, lenJ = data.rows[ i ].c.length; j < lenJ; j++ ) {

				currentRow  = data.cols[ j ].label.toString().toLowerCase().replace( ' ', '-' );
				tbodyInner += '<td class="';
				tbodyInner +=  currentRow;

				if( null !== data.rows[ i ].c[ j ] ) {

					if( NBA.hasClassRow( currentRow ) ) {
						tbodyInner += ' ' + data.rows[ i ].c[ j ].v.toString().toLowerCase().replace( ' ', '-' ) + '">';
					} else {
						tbodyInner += '">';
					}

					tbodyInner += '<span>' + data.rows[ i ].c[ j ].v + '</span>';

				} else {

					tbodyInner += '">';
				}

				tbodyInner += '</td>'; 
			}

			tbodyInner += '</tr>';
		}

		tbody.innerHTML += tbodyInner;

		table.appendChild( thead );
		table.appendChild( tbody );

		div   = document.querySelector( '.content .inner' );
		child = document.getElementById( 'player-list' );
		spin  = document.getElementById( 'loader' );
		
		if( child ) {
			div.removeChild( child );
		}
		
		NBA.addClass( spin, 'hidden' );
		div.appendChild( table );

	};

	NBA.hasClassRow = function( currentRow ) {
		return ( currentRow === 'team' || currentRow === 'type' || currentRow === 'position' );
	};

	NBA.addEvent = function(evt, elem, func, capture ) {
		if( elem || elem.length > 0 ) {
			if ( elem.addEventListener ) {  // W3C DOM
				elem.addEventListener( evt, func, capture );
			} else if ( elem.attachEvent ) { // IE DOM
				elem.attachEvent( "on" + evt, func );
			} else { // No much to do
				elem[evt] = func;
			}
		}
	};

	NBA.addClass = function( el, className ) {
		if (el.classList) {
		  el.classList.add( className );
		}
		else {
		  el.className += ' ' + className;
		}
	};

	NBA.removeClass = function( el, className ) {
		if ( el.classList ) {
		  el.classList.remove(className);
		} else {
		  el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
	};

	NBA.empty = function( value ) {
		return ( value === '' || value === false || null === value );
	};

	if ( document.readyState !== 'loading' ) {
		NBA.init();
	} else {
		document.addEventListener( 'DOMContentLoaded', NBA.init );
	}

	return NBA;

})( window );


