window.nba = ( function() {
	"use strict";

	var NBA = {},
		//CONT = document.querySelector( '.main .container' ),
		//TABS = document.querySelector( '.tabs' ),
		//CLIENT_ID   = '',
		//API_KEY     = 'AIzaSyA-n8PLEMahQMw7ck6edby5CIssqF71f1c',
		//SCOPES      = ["https://www.googleapis.com/auth/spreadsheets.readonly"],
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
			id        : 'CR',
		},
		EXC_COOKIE  = 'nbalive_excl_stats',
		COM_COOKIE  = 'nbalive_compare',
		QRY_COOKIE  = 'nbalive_query',
		ABILITIES = [
			'SPD', 'DRI', 'TPT', 'SHT', 'DEF', 'PAS'
		],

		DEFAULT_QUERY = 'SELECT A, B, C, G, I, M, N, O, P, Q, R, S, CR',
		IS_COMPARE = false,
		IS_SINGLE = false;

	NBA.init = function() {

		var exc_cookie = cookie.get( EXC_COOKIE ),
			qry_cookie = cookie.get( QRY_COOKIE );

		cookie.set( COM_COOKIE, JSON.stringify( {} ) );

		if( !exc_cookie ) {
			cookie.set( EXC_COOKIE, JSON.stringify( {} ) );
		}

		if( !qry_cookie ) {
			cookie.set( QRY_COOKIE, JSON.stringify( {} ) );
		}
		
		NBA.initTabs();

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

	NBA.checkOnChange = function( evt ) {
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
		var qry_cookie = cookie.get( QRY_COOKIE );

		IS_SINGLE  = false;
		IS_COMPARE = false;
		NBA.requestData( ( qry_cookie.query ? qry_cookie.query : '' ) );
		
		var btn = document.getElementById( 'search-submit' );
		NBA.addEvent( 'click', btn, NBA.processForm, false );
	};

	NBA.processForm = function( evt ) {
		evt.preventDefault();

		var form = new FormData( document.forms.namedItem( 'form' ) ),
			spin = document.getElementById( 'loader' ),
			wher = false,
			qStr = DEFAULT_QUERY,
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
			table  = document.getElementById( 'player-list' ),
			single = document.getElementById( 'player-single' ),
			key;

		NBA.removeClass( spin, 'hidden' );

		if( single ) {
			NBA.addClass( single, 'hidden' );
		}

		if( table ) {
			NBA.addClass( table, 'hidden' );
		}

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

						var value = data[ key ];

						if( key === 'name' ) {
							value = NBA.ucWords( value );
						}

						qStr += TABLE_MAP[ key ] + ' CONTAINS "' + value + '"';

					}
				}
			}
		}

		IS_SINGLE  = false;
		IS_COMPARE = false;
		NBA.requestData( qStr );
	};


	NBA.requestData = function( qStr ) {

		var list  = document.getElementById( 'player-list' ),
			spin  = document.getElementById( 'loader' );

		if( list ) {
			NBA.addClass( list, 'hidden' );
		}

		if( spin ) {
			NBA.removeClass( spin, 'hidden' );
		}

		var query = new google.visualization.Query( SHEET_URL );
			qStr  = qStr ? qStr : DEFAULT_QUERY;

		query.setQuery( qStr );
		query.send( NBA.buildResponse );

		if( !IS_SINGLE && !IS_COMPARE ) {
			cookie.set( QRY_COOKIE, JSON.stringify( { query: qStr } ) );
		}
	};

	NBA.buildResponse = function( response ) {

		if ( response.isError() ) {
			alert( 'Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage() );
			return;
		}
		var data = response.getDataTable();
		var str = data.toJSON();


		
		if( IS_SINGLE ) {

			NBA.buildTableSingle( JSON.parse( str ) );

		} else if( IS_COMPARE ) {
			
			NBA.buildTableCompare( JSON.parse( str ) );

		} else {

			NBA.buildTable( JSON.parse( str ) );
		}
	
	};

	NBA.buildTable = function( data ) {

		var div, spin, child, key, i, j, lenI, lenJ, table, thead, tbody, theadInner = '', tbodyInner = '',
			currentRow, currentVal, theRow, theData, compareAction, viewAction, id, rowLimit, dataInner = '';

		table = document.createElement( 'table' );
		table.setAttribute( 'id', 'player-list' );

		thead = document.createElement( 'thead' );
		thead.className = 'player-list-head';

		tbody = document.createElement( 'tbody' );
		tbody.className = 'player-list-body';

		for( key in data.cols ) {
			if( data.cols[ key ].label === 'GAME OVR' ) {
				theadInner += '<th>OVERALL</th>';
			} else if( ABILITIES.indexOf( data.cols[ key ].label ) === -1 && data.cols[ key ].label !== 'ID' ) {
				theadInner += '<th>' + data.cols[ key ].label + '</th>';
			} else {
				continue;
			}
		}

		theadInner += '<th>COMPARE</th>';
		theadInner += '<th></th>';
		thead.innerHTML = '<tr>' + theadInner + '</tr>';
		

		for( i = 0, lenI = data.rows.length; i < lenI; i++ ) {

			tbodyInner = '';
			dataInner  = '';
			rowLimit = data.rows[ i ].c.length - 7;
			id = '';

			for( j = 0, lenJ = data.rows[ i ].c.length; j < lenJ; j++ ) {

				currentRow  = data.cols[ j ].label.toString().replace( ' ', '-' );
				currentVal  = ( null !== data.rows[ i ].c[ j ] ) ? data.rows[ i ].c[ j ].v : '';

				if( j >= rowLimit ) {

					if( currentRow.toLowerCase() === 'id' ) {

						id = currentVal;

					} else {
					
						dataInner += '<div class="stats ability">';
						dataInner += '<div class="stats-detail"><div class="stats-label">' + STATS_ABBR[ currentRow ] + '</div>';
						dataInner += '<div class="stats-value">' + ( currentVal ) + '</div></div>';
						dataInner += '<div class="stats-bar">';
						dataInner += '<div class="stats-bar-value" style="width:' + ( currentVal ) + '%;"></div>';
						dataInner += '</div></div>';

					}

				} else {
					
					tbodyInner += '<td class="';
					tbodyInner +=  currentRow.toLowerCase();

					if( currentVal ) {

						if( NBA.hasClassRow( currentRow.toLowerCase() ) ) {
							tbodyInner += ' ' + currentVal.toString().toLowerCase().replace( ' ', '-' ) + '">';
						} else {
							tbodyInner += '">';
						}

						tbodyInner += '<span>' + currentVal + '</span>';

					} else {

						tbodyInner += '">';
					}

					tbodyInner += '</td>'; 
					
				}
			}

			compareAction = NBA.getCompareAction();
			viewAction = NBA.getViewAction();

			theRow = document.createElement( 'tr' );
			theData = document.createElement( 'tr' );
			theData.className = 'data hidden';
			theData.innerHTML = '<td colspan=8>' + dataInner + '</td>';

			theRow.innerHTML = tbodyInner;
			theRow.setAttribute( 'data-id', id );
			theRow.appendChild( compareAction );
			theRow.appendChild( viewAction );

			
			tbody.appendChild( theRow );
			tbody.appendChild( theData );
		}

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

	NBA.getViewAction = function() {

		var qv, fv, td, cp;

		td = document.createElement( 'td' );
		td.className = 'actions';

		qv = document.createElement( 'a' );
		qv.className = 'quick-view';
		qv.innerHTML = '<i class="icon-chevron-down"></i>';
		qv.setAttribute( 'title', 'Quick View' );

		NBA.addEvent( 'click', qv, NBA.quickViewRow, true );

		fv = document.createElement( 'a' );
		fv.className = 'full-view';
		fv.innerHTML = '<i class="icon-eye"></i>';
		fv.setAttribute( 'title', 'View Full Stats' );

		NBA.addEvent( 'click', fv, NBA.processRow, true );

		cp = document.createElement( 'a' );
		cp.className = 'compare disabled';
		cp.innerHTML = '<i class="icon-compare"></i>';
		cp.setAttribute( 'title', 'View Comparison' );

		NBA.addEvent( 'click', cp, NBA.comparePlayer, true );

		td.appendChild( qv );
		td.appendChild( fv );
		td.appendChild( cp );

		return td;
	};

	NBA.getCompareAction = function() {

		var com, check, label, span1, span2;

		com = document.createElement( 'td' );
		com.className = 'compares';
		
		check = document.createElement( 'input' );
		check.className = 'compare';
		check.setAttribute( 'type', 'checkbox' );
		check.setAttribute( 'value', true );
		check.setAttribute( 'name', 'compare[]' );
		check.setAttribute( 'class', 'switch-input switch-compare' );

		label = document.createElement( 'label' );
		span1 = document.createElement( 'span' );
		span2 = document.createElement( 'span' );

		label.setAttribute( 'class', 'switch' );
		span1.setAttribute( 'class', 'switch-label' );
		span1.setAttribute( 'data-on', 'ON' );
		span1.setAttribute( 'data-off', 'OFF' );
		span2.setAttribute( 'class', 'switch-handle' );


		label.appendChild( check );
		label.appendChild( span1 );
		label.appendChild( span2 );

		com.appendChild( label );

		NBA.addEvent( 'click', check, NBA.addToCompare, true );

		return com;
	};


	NBA.addToCompare = function( evt ) {

		var checked = this.checked,
			errors  = false,
			checks  = document.querySelectorAll( '[data-compare]' ),
			length  = checks.length,
			td, tds;

		if( checked ) {

			if( length < 4 ) {
				this.setAttribute( 'data-compare', '' );

				if( length > 0 && ! errors ) {
					td  = this.parentNode.parentNode.nextElementSibling;
					tds = document.querySelector( 'a.compare:not(.disabled)' );
					if( tds ) {
						NBA.addClass( tds, 'disabled' );
					}
					NBA.removeClass( td.querySelector( 'a.compare' ), 'disabled' );
				}

			} else {

				evt.preventDefault();
				alert( 'Comparison only up to 4 players' );
				errors = true;
			}

		} else {

			if( this.hasAttribute( 'data-compare' ) ) {
				this.removeAttribute( 'data-compare' );

				td = document.querySelector( 'a.compare:not(.disabled)');

				if( td ) {
					NBA.addClass( td, 'disabled' );
				}

				checks  = document.querySelectorAll( '[data-compare]' );
				length  = checks.length;

				if( length > 1 ) {
					tds = checks[ length - 1 ].parentNode.parentNode.nextElementSibling.querySelector( '.compare' );
					if( tds ) {
						NBA.removeClass( tds , 'disabled' );
					}
				}
			}

		}

	};


	NBA.buildTableSingle = function( data ) {
		var div, spin, i, len, className, 
			table, thead, tbody, 
			tbodyInner = '',
			currentRow, currentVal, skip = [],
			name, ovr, pos, ht, wt, team, lineup,
			program;

		spin  = document.getElementById( 'loader' );
		div   = document.querySelector( '.content .inner' );
		
		table = document.createElement( 'div' );
		table.setAttribute( 'id', 'player-single' );

		thead = document.createElement( 'div' );
		thead.className = 'player-single-head';

		tbody = document.createElement( 'div' );
		tbody.className = 'player-single-body';


		if( data.rows ) {

			for( i = 0, len = data.rows[ 0 ].c.length; i < len; i ++ ) {

				currentRow = data.cols[ i ].label.toString().replace( ' ', '-' );
				currentVal = ( null !== data.rows[ 0 ].c[ i ]  ) ? data.rows[ 0 ].c[ i ].v  : '';

				if( !STATS_ABBR[ currentRow ] ) {

					switch ( currentRow.toLowerCase() ) {

						case 'player-name':

							name = '<h2 class="name">' + currentVal + '</h2>';

						break;

						case 'game-ovr':

							var color = 'bronze';

							if( parseInt( currentVal ) > 83 ) {
								color = 'elite';
							} else if( parseInt( currentVal ) > 72 ) {
								color = 'gold';
							} else if( parseInt( currentVal ) > 62 ) {
								color = 'silver';
							}

							ovr = '<div class="ovr ' + data.rows[ 0 ].c[ 6 ].v.toString().toLowerCase() + '">' + currentVal + '</div>';

						break;

						case 'position':

							pos = '<div class="position">' + currentVal + '</div>';
							
						break;

						case 'lineup':

							lineup = '<div class="lineup ' + currentVal.toString().toLowerCase().replace( ' ', '-' ) + '">' + currentVal + '</div>';

						break;

						case 'team':

							team = '<div class="team"><span class="stats-label">Team</span>' + 
								   '<span class="stats-value ' + currentVal.toString().toLowerCase() + '"></span></div>';

						break;

						case 'wt':

							wt = '<div class="weight"><span class="stats-label">Weight</span>' + 
								 '<span class="stats-value">' + currentVal + '</span></div>';

						break;

						case 'ht':

							ht = '<div class="height"><span class="stats-label">Height</span>' + 
								 '<span class="stats-value">' + currentVal + '</span></div>';

						break;

						case 'program':

							program = '<div class="program"><span class="stats-label">Program</span>' + 
										'<span class="stats-value">' + currentVal + '</span></div>';
						break;


						default:
						continue;
					}

				} else {

					if( ABILITIES.indexOf( currentRow ) > -1 && skip.indexOf( currentRow ) === -1  ) {
						skip.push( currentRow );
					} else {

						className = '';

						if( ABILITIES.indexOf( currentRow ) > -1 ) {
							className += ' ability';
						}

						tbodyInner += '<div class="stats' + className + '">';
						tbodyInner += '<div class="stats-detail"><div class="stats-label">' + STATS_ABBR[ currentRow ] + '</div>';
						tbodyInner += '<div class="stats-value">' + ( currentVal ) + '</div></div>';
						tbodyInner += '<div class="stats-bar">';
						tbodyInner += '<div class="stats-bar-value" style="width:' + ( currentVal ) + '%;"></div>';
						tbodyInner += '</div></div>';
					}
					
				}
			}


			thead.innerHTML = '<div class="pos-lineup">' + pos + lineup + '</div>' +
								name + '<div class="desc">' + program + wt + ht + team +  '</div>' + ovr;

			NBA.getBackButton( thead, 'single' );
		}

		tbody.innerHTML = tbodyInner;
		table.appendChild( thead );
		table.appendChild( tbody );
		div.appendChild( table );

		NBA.addClass( spin, 'hidden' );
	};

	NBA.getBackButton = function( el, type ) {
		var btn = document.createElement( 'a' );
		btn.innerHTML = 'Back';
		btn.className = 'back back-' + type;
		NBA.addEvent( 'click', btn, NBA.back, false );
		el.appendChild( btn );
	};

	NBA.back = function( evt ) {

		evt.preventDefault();

		var spin = document.getElementById( 'loader' ),
			table = document.getElementById( 'player-list' );

		NBA.removeClass( spin, 'hidden' );

		if( this.className.indexOf( 'back-single' ) > -1 ) {

			var single = document.querySelector( '#player-single' );
				single.parentNode.removeChild( single );

			window.setTimeout( function(){
				NBA.addClass( spin, 'hidden' );
				NBA.removeClass( table, 'hidden' );
			}, 30 );
			

		} else if( this.className.indexOf( 'back-compare' ) ) {

			var compare = document.querySelector( '#player-compare' );
				compare.parentNode.removeChild( compare );

			window.setTimeout( function(){
				NBA.addClass( spin, 'hidden' );
				NBA.removeClass( table, 'hidden' );
			}, 30 );
		}
	};

	NBA.comparePlayer = function() {

		if( this.className.indexOf( 'disabled' ) === -1 ) {

			var elems = document.querySelectorAll( '[data-compare]' ),
				query, i, len, parent, target;

			query = 'SELECT * WHERE';

			for( i = 0, len = elems.length; i < len; i++ ) {

				parent = elems[i].parentNode.parentNode.parentNode;
				target = parent.getAttribute( 'data-id' );
				query += ' ' + TABLE_MAP.id + ' = "' + target + '"';

				if( i < ( len - 1 ) ) {
					query += ' OR ';
				} else {
					query += ' LIMIT ' + len;
				}
			}

			IS_COMPARE = true;
			IS_SINGLE  = false;

			NBA.requestData( query );
		}

	};

	NBA.getDescHTML = function( row, value ) {

		var html = '';

		switch ( row.toLowerCase() ) {

			case 'player-name':
				html = '<h2 class="name">' + value + '</h2>';
			break;

			case 'game-ovr':

				var color = 'bronze';

				if( parseInt( value ) > 83 ) {
					color = 'elite';
				} else if( parseInt( value ) > 72 ) {
					color = 'gold';
				} else if( parseInt( value ) > 62 ) {
					color = 'silver';
				}

				html = '<div class="ovr ' + color + '">' + value + '</div>';
				

			break;

			case 'position':

				html = '<div class="position">' + value + '</div>';
				
			break;

			case 'lineup':

				html = '<div class="lineup ' + value.toString().toLowerCase().replace( ' ', '-' ) + '">' + value + '</div>';

			break;

			case 'team':

				html = '<div class="team"><span class="stats-label">Team</span>' + 
					   '<span class="stats-value ' + value.toString().toLowerCase() + '"></span></div>';


			break;

			case 'wt':

				html = '<div class="weight"><span class="stats-label">Weight</span>' + 
					   '<span class="stats-value">' + value + '</span></div>';

			break;

			case 'ht':

				html = '<div class="height"><span class="stats-label">Height</span>' + 
					   '<span class="stats-value">' + value + '</span></div>';

			break;

			case 'program':

				html = '<div class="program"><span class="stats-label">Program</span>' + 
					   '<span class="stats-value">' + value + '</span></div>';

			break;
		}

		return html;
	};

	NBA.buildTableCompare = function( data ) {

		var compareLength  = data.rows.length,
			headerTemplate = '<div class="cf">' + 
							 '<div class="pos-lineup">{position}{lineup}</div>' + 
							 '{player-name}' + 
							 '</div>' + 
							 '<div class="desc">{program}{wt}{ht}{team}</div>' + 
							 '{game-ovr}',
			table = document.createElement( 'div' ),
			thead = document.createElement( 'div' ),
			tbody = document.createElement( 'div' ),
			cont  = document.querySelector( '.content .inner' ),
			spin  = document.getElementById( 'loader' ),
			html, theadInner = [], tbodyInner = [], 
			className, count, i, len, skip = [], currentRow, currentVal;


		table.setAttribute( 'id', 'player-compare' );
		thead.setAttribute( 'id', 'player-compare-desc' );
		tbody.setAttribute( 'id', 'player-compare-stats' );
		table.className = 'cols-' + compareLength;

		for( i = 0, len = data.cols.length; i < len; i++ ) {
			
			currentRow = data.cols[ i ].label.toString().replace( ' ', '-' );

			if( !STATS_ABBR[ currentRow ] ) {

				for( count = 0; count < compareLength; count++ ) {

					currentVal = ( null !== data.rows[ count ].c[ i ] ) ? data.rows[ count ].c[ i ].v  : '';
					html = NBA.getDescHTML( currentRow, currentVal );
					theadInner[ count ] = theadInner[ count ] ? 
												theadInner[ count ] : 
												'<div class="desc-col" id="compare-' + ( count + 1 ) + '">' + headerTemplate + '</div>';
					theadInner[ count ] = theadInner[ count ].replace( '{' + currentRow.toLowerCase() + '}', html );

				}

			} else {

				if( ABILITIES.indexOf( currentRow ) > -1 && skip.indexOf( currentRow ) === -1  ) {

					skip.push( currentRow );

				} else {

					for( count = 0; count < compareLength; count++ ) {

						currentVal = ( null !== data.rows[ count ].c[ i ] ) ? data.rows[ count ].c[ i ].v  : '';
						className = '';

						if( ! tbodyInner[ i ] ) {
							tbodyInner[ i ] = [];
						}

						if( ! tbodyInner[ i ][ count ] ) {
							tbodyInner[ i ][ count ] = '';
						}

						if( ABILITIES.indexOf( currentRow ) > -1 ) {
							className = ' ability';
						}

						tbodyInner[ i ][ count ] += '<div class="stats-' + ( count + 1 ) + ' stats-col">';
							tbodyInner[ i ][ count ] += '<div class="stats' + className +'">';
								tbodyInner[ i ][ count ] += '<div class="stats-bar">';
									tbodyInner[ i ][ count ] += '<div class="stats-bar-value" style="width:' + ( currentVal ) + '%;"></div>';
								tbodyInner[ i ][ count ] += '</div>';
								tbodyInner[ i ][ count ] += '<div class="stats-value">';
									tbodyInner[ i ][ count ] += '<span>' + ( currentVal ) + '</span>';
								tbodyInner[ i ][ count ] += '</div>';
							tbodyInner[ i ][ count ] += '</div>';
						tbodyInner[ i ][ count ] += '</div>';
							
					}

					if( tbodyInner[ i ] ) {
						tbodyInner[ i ] = '<div class="stats-row"><div class="stats-label stats-col">' + STATS_ABBR[ currentRow ] + '</div>' + tbodyInner[ i ].join( '' ) + '</div>';
					}
				}
			}

		}

		thead.innerHTML = '<div class="versus">vs</div>' + theadInner.join( '' );
		tbody.innerHTML = tbodyInner.join( '' );
		table.appendChild( thead );
		table.appendChild( tbody );

		NBA.getBackButton( thead, 'compare' );

		NBA.addClass( spin, 'hidden' );
		cont.appendChild( table );

		
	
	};

	NBA.quickViewRow = function( evt ) {
		var el = evt.currentTarget,
			par = el.parentNode.parentNode,
			unc = par.nextElementSibling;

		if( unc.className.indexOf( 'hidden' ) > -1 ) {
			NBA.removeClass( unc, 'hidden' );
			el.children[0].className = 'icon-chevron-up';
		} else {
			NBA.addClass( unc, 'hidden' );
			el.children[0].className = 'icon-chevron-down';
		}
	};

	NBA.processRow = function( evt ) {

		var elem, par, qStr;

		elem  = evt.currentTarget;
		par   = elem.parentNode.parentNode;
		qStr  = 'SElECT * WHERE ' + TABLE_MAP.id + ' = "' + par.getAttribute( 'data-id' ) + '"';

		IS_SINGLE = true;
		IS_COMPARE = false;
		NBA.requestData( qStr );
	};

	NBA.hasClassRow = function( currentRow ) {
		return ( currentRow === 'team' || currentRow === 'type' || currentRow === 'position' || currentRow === 'lineup' );
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

	NBA.triggerEvent = function( evt, el ) {
		var event = document.createEvent( 'HTMLEvents' );
		event.initEvent( evt, true, false );
		el.dispatchEvent(event);
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

	NBA.ucWords = function( str ) {

		str = str.toLowerCase().replace(/\b[a-z]/g, function( letter ) {
			return letter.toUpperCase();
		} );

		if( str.indexOf( 'Lebron' ) > -1 ) {
			str = str.replace( 'Lebron', 'LeBron' );
		}

		return str;
	};

	if ( document.readyState !== 'loading' ) {
		NBA.init();
	} else {
		document.addEventListener( 'DOMContentLoaded', NBA.init );
	}

	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] !== 'undefined' ? args[number] : match;
		});
	};

	return NBA;

})( window );