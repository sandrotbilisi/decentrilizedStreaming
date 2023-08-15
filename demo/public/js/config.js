// turnConfig = {
// iceServers: [
// 	{
//         urls: 'stun:stun.easybell.de:3478',
//         username: 'openrelayproject',
//         credentials: 'openrelayproject'
//     }
// 	// {
// 	// 	username:
// 	// 		'0kYXFmQL9xojOrUy4VFemlTnNPVFZpp7jfPjpB3AjxahuRe4QWrCs6Ll1vDc7TTjAAAAAGAG2whXZWJUdXRzUGx1cw==',
// 	// 	credential: '285ff060-5a58-11eb-b269-0242ac140004',
// 	// 	urls: [
// 	// 		'turn:bn-turn1.xirsys.com:80?transport=udp',
// 	// 		'turn:bn-turn1.xirsys.com:3478?transport=udp',
// 	// 		'turn:bn-turn1.xirsys.com:80?transport=tcp',
// 	// 		'turn:bn-turn1.xirsys.com:3478?transport=tcp',
// 	// 		'turns:bn-turn1.xirsys.com:443?transport=tcp',
// 	// 		'turns:bn-turn1.xirsys.com:5349?transport=tcp',
// 	// 	],
// 	// },
// ],
// iceServers: [
//     {
//         urls: "stun:relay.metered.ca:80",
//       },
//       {
//         urls: "turn:relay.metered.ca:80",
//         username: "00ac0e818e85f8db05489fac",
//         credential: "r5iqKSiCwlCw5MSj",
//       },
//       {
//         urls: "turn:relay.metered.ca:443",
//         username: "00ac0e818e85f8db05489fac",
//         credential: "r5iqKSiCwlCw5MSj",
//       },
//       {
//         urls: "turn:relay.metered.ca:443?transport=tcp",
//         username: "00ac0e818e85f8db05489fac",
//         credential: "r5iqKSiCwlCw5MSj",
//       },
//   ],
// }

const RTC_CONFIGURATION = {
	iceServers: [
		{ urls: 'stun:stun.l.google.com:19302' },
		{
			url: 'turn:numb.viagenie.ca',
			credential: 'muazkh',
			username: 'webrtc@live.com',
		},
	],
}

const LIVE_STREAM_ABI = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint256',
				name: 'streamId',
				type: 'uint256',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'commenter',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'string',
				name: 'content',
				type: 'string',
			},
		],
		name: 'CommentAdded',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint256',
				name: 'streamId',
				type: 'uint256',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'owner',
				type: 'address',
			},
		],
		name: 'StreamCreated',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint256',
				name: 'streamId',
				type: 'uint256',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'owner',
				type: 'address',
			},
		],
		name: 'StreamDeactivated',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint256',
				name: 'streamId',
				type: 'uint256',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'tipper',
				type: 'address',
			},
			{
				indexed: false,
				internalType: 'uint256',
				name: 'amount',
				type: 'uint256',
			},
		],
		name: 'Tipped',
		type: 'event',
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: 'uint256',
				name: 'streamId',
				type: 'uint256',
			},
			{
				indexed: true,
				internalType: 'address',
				name: 'watcher',
				type: 'address',
			},
		],
		name: 'WatcherAdded',
		type: 'event',
	},
	{
		stateMutability: 'payable',
		type: 'fallback',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'streamId',
				type: 'uint256',
			},
			{
				internalType: 'string',
				name: 'content',
				type: 'string',
			},
		],
		name: 'addComment',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: '',
				type: 'address',
			},
		],
		name: 'balances',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'watchFee',
				type: 'uint256',
			},
		],
		name: 'createStream',
		outputs: [
			{
				internalType: 'uint256',
				name: 'streamId',
				type: 'uint256',
			},
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'streamId',
				type: 'uint256',
			},
		],
		name: 'deactivateStream',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function',
	},
	{
		inputs: [],
		name: 'getBalance',
		outputs: [
			{
				internalType: 'uint256',
				name: '',
				type: 'uint256',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'streamId',
				type: 'uint256',
			},
		],
		name: 'getCommentsByStreamId',
		outputs: [
			{
				components: [
					{
						internalType: 'address',
						name: 'commenter',
						type: 'address',
					},
					{
						internalType: 'string',
						name: 'message',
						type: 'string',
					},
				],
				internalType: 'struct LiveStreaming.Comment[]',
				name: '',
				type: 'tuple[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'streamId',
				type: 'uint256',
			},
		],
		name: 'getStreamByID',
		outputs: [
			{
				components: [
					{
						internalType: 'address',
						name: 'owner',
						type: 'address',
					},
					{
						internalType: 'bool',
						name: 'isActive',
						type: 'bool',
					},
					{
						internalType: 'uint256',
						name: 'watchFee',
						type: 'uint256',
					},
					{
						internalType: 'uint256',
						name: 'StreamID',
						type: 'uint256',
					},
				],
				internalType: 'struct LiveStreaming.Stream',
				name: '',
				type: 'tuple',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [],
		name: 'getStreamIds',
		outputs: [
			{
				internalType: 'uint256[]',
				name: '',
				type: 'uint256[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'streamId',
				type: 'uint256',
			},
		],
		name: 'getWatchesByStream',
		outputs: [
			{
				internalType: 'uint256[]',
				name: '',
				type: 'uint256[]',
			},
			{
				internalType: 'address[]',
				name: '',
				type: 'address[]',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'address',
				name: 'user',
				type: 'address',
			},
		],
		name: 'isWhitelisted',
		outputs: [
			{
				internalType: 'bool',
				name: '',
				type: 'bool',
			},
		],
		stateMutability: 'view',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'streamId',
				type: 'uint256',
			},
		],
		name: 'joinStream',
		outputs: [],
		stateMutability: 'payable',
		type: 'function',
	},
	{
		inputs: [
			{
				internalType: 'uint256',
				name: 'streamId',
				type: 'uint256',
			},
		],
		name: 'tip',
		outputs: [],
		stateMutability: 'payable',
		type: 'function',
	},
	{
		stateMutability: 'payable',
		type: 'receive',
	},
]
