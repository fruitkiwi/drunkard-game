if (typeof WScript == 'undefined')
	throw new Error('Win version only')
var stdin = WScript.StdIn
var stdout = WScript.StdOut
var args = WScript.arguments
var key, quick

try {
	stdout.Write('\r')
}
catch(e) {
	WScript.Echo('WSH only: cscript p.js')
	WScript.quit()
}

if (args.length > 0)
	if (args.length == 1)
		key = args(0)
	else 
		quitP('Wrong args number')
if (key)
	if (key.match(/^(-h|--help|\/\?)$/)) {
		quitP(getHelp())
	}
	else {
		quitP('Wrong args')
	}

stdout.WriteLine('\tstart to launch game \n\tqstart to quick launch\n\tquit | exit to leave\n')

var input = ''
var cards = [], pl1 = [], pl2 = []
var c1, c2, r1 = [], r2 = []

for (var i = 0; i < 13; i++)
	for (var j = 0; j< 4; j++)
		cards.push({rank: i, suit: j})

while (input != 'quit' && input != 'exit') {
	stdout.Write('> ')
	input = stdin.ReadLine()
	if (input == 'start' || (quick = (input == 'qstart'))) {
		try {
			game()
		}
		catch(e) {
			if (e instanceof Message) {
				stdout.WriteLine(e.message)
				pl1.splice(0, pl1.length)
				pl2.splice(0, pl2.length)
				r1.splice(0, r1.length)
				r2.splice(0, r2.length)
			}
			else
				throw(e)
		}
	}
}

quitP('Bye!')


function game() {
	var count = 0, f = [], rand, k
	while (count < 52) {
		rand = Math.floor(Math.random() * 52)
		if (!f[rand]) {
			f[rand] = 1
			count++
			if (count % 2 == 0)
				pl1.unshift(cards[rand])
			else
				pl2.unshift(cards[rand])
		}
	}

	while (pl1.length > 0 && pl2.length > 0) {
		c1 = pl1.shift()
		c2 = pl2.shift()
		printTurn(c1, c2)
		insertPause()
		if (c1.rank == c2.rank) {
			k = -1
			do {
				k += 2
				war(k)
				insertPause()
			} while(r1[k].rank == r2[k].rank)

			var l = r1.length + r2.length + 2
			if (r1[k].rank > r2[k].rank) {
				stdout.WriteLine('Player 1 wins the war: ' + l + ' cards in bank')
				pushArr(r1, pl1)
				pushArr(r2, pl1)
				pl1.push(c1, c2)
			}
			else {
				stdout.WriteLine('Player 2 wins the war: ' + l + ' cards in bank')
				pushArr(r2, pl2)
				pushArr(r1, pl2)
				pl2.push(c1, c2)
			}
		}
		else
			if (c1.rank > c2.rank) {
				pl1.push(c1, c2)
				stdout.WriteLine('Player 1 gets the bank.')
			}
			else
				if (c1.rank < c2.rank) {
					pl2.push(c2, c1)
					stdout.WriteLine('Player 2 gets the bank.')
				}
		insertPause()
	}

	if (pl1.length == 0 && pl2.length == 0)
		throw new Message('Draw!')
	if (pl1.length == 52)
		throw new Message('Player 1 wins the game.')
	if (pl2.length == 52)
		throw new Message('Player 2 wins the game.')
}

function insertPause() {
	if (!quick)
		WScript.Sleep(2000)
}
function war(kk) {
	if (pl1.length < 2)
		throw new Message('Player 2 wins the game.')
	if (pl2.length < 2)
		throw new Message('Player 1 wins the game.')
	stdout.WriteLine('War!')
	insertPause()
	r1.push(pl1.shift(), pl1.shift())
	r2.push(pl2.shift(), pl2.shift())
	printTurn(r1[kk], r2[kk])
}
function getHelp() {
	var help = '\t' + repeatStr('-', 35) + '\n\t\t-The Drunkard game-\n\t\tversion 1.0.0\n' + '\t\tcscript p.js [param]\n\t' + repeatStr('-', 35) 
	return help
}
function repeatStr(str, count) {
	return new Array(count+1).join(str)
}
function quitP(t) {
	stdout.WriteLine(t)
	WScript.quit()
}
function printTurn(c1, c2) {
	var r1 = makeRank(c1.rank)
	var r2 = makeRank(c2.rank)
	var s1 = makeSuit(c1.suit)
	var s2 = makeSuit(c2.suit)
	var i = 10, j = 6
	var y = '\nPlayer 1' + '\t\tPlayer 2\n' +
			'cards remaining: ' + pl1.length + '\tcards remaining: ' + pl2.length
	var x = '\u250C' + repeatStr('\u2500', i) + '\u2510' +
		'\t\t\u250C' + repeatStr('\u2500', i) + '\u2510\n' + 
		'| ' + r1 + ' ' + s1 + repeatStr(' ', r1.length > 1 ? j-1 : j) + '|' +
		'\t\t| ' + r2 + ' ' + s2 + repeatStr(' ', r2.length > 1 ? j-1 : j) + '|\n' +
		repeatStr('|' + repeatStr(' ', i) + '|\t\t|' + repeatStr(' ', i) + '|\n', 5) +
		'|' + repeatStr(' ', r1.length > 1 ? j-1 : j) + r1 + ' ' + s1 + ' |' +
		'\t\t' + '|' + repeatStr(' ', r2.length > 1 ? j-1 : j) + r2 + ' ' + s2 + ' |\n' +
		'\u2514' + repeatStr('\u2500', i) + '\u2518' +
		'\t\t\u2514' + repeatStr('\u2500', i) + '\u2518'
	stdout.WriteLine(y)
	stdout.WriteLine(x)
}
function pushArr(from, where) {
	while (from.length != 0)
		where.push(from.pop())
}
function Message(s) {
	this.message = s
}
function makeSuit(s) {
	switch(s) {
		case 0: return '\x06' // пики
		case 1: return '\x05' // крести
		case 2: return '\x03' // черви
		case 3: return '\x04' // буби
	}
	return null
}
function makeRank(r) { 
	var ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
	return ranks[r]
}
