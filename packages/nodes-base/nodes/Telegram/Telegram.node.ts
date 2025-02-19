import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeTypeDescription,
	INodeType,
} from 'n8n-workflow';

import {
	apiRequest,
	addAdditionalFields,
} from './GenericFunctions';


export class Telegram implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Telegram',
		name: 'telegram',
		icon: 'file:telegram.png',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Sends data to Telegram.',
		defaults: {
			name: 'Telegram',
			color: '#0088cc',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'telegramApi',
				required: true,
			}
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				options: [
					{
						name: 'Chat',
						value: 'chat',
					},
					{
						name: 'Callback',
						value: 'callback',
					},
					{
						name: 'Message',
						value: 'message',
					}
				],
				default: 'message',
				description: 'The resource to operate on.',
			},



			// ----------------------------------
			//         operation
			// ----------------------------------

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'chat',
						],
					},
				},
				options: [
					{
						name: 'Get',
						value: 'get',
						description: 'Get up to date information about a chat.',
					},
					{
						name: 'Leave',
						value: 'leave',
						description: 'Leave a group, supergroup or channel.',
					},
					{
						name: 'Member',
						value: 'member',
						description: 'Get the member of a chat.',
					},
					{
						name: 'Set Description',
						value: 'setDescription',
						description: 'Set the description of a chat.',
					},
					{
						name: 'Set Title',
						value: 'setTitle',
						description: 'Set the title of a chat.',
					},
				],
				default: 'get',
				description: 'The operation to perform.',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'callback',
						],
					},
				},
				options: [
					{
						name: 'Answer Query',
						value: 'answerQuery',
						description: 'Send answer to callback query sent from inline keyboard.',
					},
				],
				default: 'answerQuery',
				description: 'The operation to perform.',
			},

			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				displayOptions: {
					show: {
						resource: [
							'message',
						],
					},
				},
				options: [
					{
						name: 'Edit Message Text',
						value: 'editMessageText',
						description: 'Edit a text message',
					},
					{
						name: 'Send Audio',
						value: 'sendAudio',
						description: 'Send a audio file',
					},
					{
						name: 'Send Chat Action',
						value: 'sendChatAction',
						description: 'Send a chat action',
					},
					{
						name: 'Send Document',
						value: 'sendDocument',
						description: 'Send a document',
					},
					{
						name: 'Send Message',
						value: 'sendMessage',
						description: 'Send a text message',
					},
					{
						name: 'Send Photo',
						value: 'sendPhoto',
						description: 'Send a photo',
					},
					{
						name: 'Send Sticker',
						value: 'sendSticker',
						description: 'Send a sticker',
					},
					{
						name: 'Send Video',
						value: 'sendVideo',
						description: 'Send a video',
					},
				],
				default: 'sendMessage',
				description: 'The operation to perform.',
			},


			// ----------------------------------
			//         chat / message
			// ----------------------------------

			{
				displayName: 'Chat ID',
				name: 'chatId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'getChat',
							'leaveChat',
							'getChatMember',
							'setChatDescription',
							'setChatTitle',
							'sendAudio',
							'sendChatAction',
							'sendDocument',
							'sendMessage',
							'sendPhoto',
							'sendSticker',
							'sendVideo',
						],
						resource: [
							'chat',
							'message',
						],
					},
				},
				required: true,
				description: 'Unique identifier for the target chat or username of the target<br />channel (in the format @channelusername).',
			},


			// ----------------------------------
			//         chat
			// ----------------------------------

			// ----------------------------------
			//         chat:member
			// ----------------------------------
			{
				displayName: 'User ID',
				name: 'userId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'member'
						],
						resource: [
							'chat',
						],
					},
				},
				required: true,
				description: 'Unique identifier of the target user.',
			},


			// ----------------------------------
			//         chat:setDescription
			// ----------------------------------
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'setDescription'
						],
						resource: [
							'chat',
						],
					},
				},
				required: true,
				description: 'New chat description, 0-255 characters.',
			},


			// ----------------------------------
			//         chat:setTitle
			// ----------------------------------
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'setTitle'
						],
						resource: [
							'chat',
						],
					},
				},
				required: true,
				description: 'New chat title, 1-255 characters.',
			},


			// ----------------------------------
			//         callback
			// ----------------------------------

			// ----------------------------------
			//         callback:answerQuery
			// ----------------------------------
			{
				displayName: 'Query ID',
				name: 'queryId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'answerQuery'
						],
						resource: [
							'callback',
						],
					},
				},
				required: true,
				description: 'Unique identifier for the query to be answered.',
			},

			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				displayOptions: {
					show: {
						operation: [
							'answerQuery'
						],
						resource: [
							'callback',
						],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Cache Time',
						name: 'cache_time',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						default: 0,
						description: 'The maximum amount of time in seconds that the result of the callback query may be cached client-side.',
					},
					{
						displayName: 'Show Alert',
						name: 'show_alert',
						type: 'boolean',
						default: false,
						description: 'If true, an alert will be shown by the client instead of a notification at the top of the chat screen.',
					},
					{
						displayName: 'Text',
						name: 'text',
						type: 'string',
						typeOptions: {
							alwaysOpenEditWindow: true,
						},
						default: '',
						description: 'Text of the notification. If not specified, nothing will be shown to the user, 0-200 characters.',
					},
					{
						displayName: 'URL',
						name: 'url',
						type: 'string',
						default: '',
						description: 'URL that will be opened by the user\'s client.',
					},
				],
			},



			// ----------------------------------
			//         message
			// ----------------------------------

			// ----------------------------------
			//         message:editMessageText
			// ----------------------------------

			{
				displayName: 'Message Type',
				name: 'messageType',
				type: 'options',
				displayOptions: {
					show: {
						operation: [
							'editMessageText',
						],
						resource: [
							'message',
						],
					},
				},
				options: [
					{
						name: 'Inline Message',
						value: 'inlineMessage',
					},
					{
						name: 'Message',
						value: 'message',
					},
				],
				default: 'message',
				description: 'The type of the message to edit.',
			},

			{
				displayName: 'Chat ID',
				name: 'chatId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						messageType: [
							'message'
						],
						operation: [
							'editMessageText',
						],
						resource: [
							'message',
						],
					},
				},
				required: true,
				description: 'Unique identifier for the target chat or username of the target<br />channel (in the format @channelusername). To find your chat id ask @get_id_bot.',
			},
			{
				displayName: 'Message ID',
				name: 'messageId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						messageType: [
							'message'
						],
						operation: [
							'editMessageText',
						],
						resource: [
							'message',
						],
					},
				},
				required: true,
				description: 'Unique identifier of the message to edit.',
			},
			{
				displayName: 'Inline Message ID',
				name: 'inlineMessageId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						messageType: [
							'inlineMessage'
						],
						operation: [
							'editMessageText',
						],
						resource: [
							'message',
						],
					},
				},
				required: true,
				description: 'Unique identifier of the inline message to edit.',
			},
			{
				displayName: 'Reply Markup',
				name: 'replyMarkup',
				displayOptions: {
					show: {
						operation: [
							'editMessageText',
						],
						resource: [
							'message',
						],
					},
				},
				type: 'options',
				options: [
					{
						name: 'None',
						value: 'none',
					},
					{
						name: 'Inline Keyboard',
						value: 'inlineKeyboard',
					},
				],
				default: 'none',
				description: 'Additional interface options.',
			},



			// ----------------------------------
			//         message:sendAudio
			// ----------------------------------
			{
				displayName: 'Audio',
				name: 'file',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'sendAudio'
						],
						resource: [
							'message',
						],
					},
				},
				description: 'Audio file to send. Pass a file_id to send a file that exists on the Telegram servers (recommended)<br />or pass an HTTP URL for Telegram to get a file from the Internet.',
			},



			// ----------------------------------
			//         message:sendChatAction
			// ----------------------------------
			{
				displayName: 'Action',
				name: 'action',
				type: 'options',
				displayOptions: {
					show: {
						operation: [
							'sendChatAction'
						],
						resource: [
							'message',
						],
					},
				},
				options: [
					{
						name: 'Find Location',
						value: 'find_location',
					},
					{
						name: 'Record Audio',
						value: 'record_audio',
					},
					{
						name: 'Record Video',
						value: 'record_video',
					},
					{
						name: 'Record Video Note',
						value: 'record_video_note',
					},
					{
						name: 'Typing',
						value: 'typing',
					},
					{
						name: 'Upload Audio',
						value: 'upload_audio',
					},
					{
						name: 'Upload Document',
						value: 'upload_document',
					},
					{
						name: 'Upload Photo',
						value: 'upload_photo',
					},
					{
						name: 'Upload Video',
						value: 'upload_video',
					},
					{
						name: 'Upload Video Note',
						value: 'upload_video_note',
					},
				],
				default: 'typing',
				description: 'Type of action to broadcast. Choose one, depending on what the user is about to receive.<br />The status is set for 5 seconds or less (when a message arrives from your bot).',
			},



			// ----------------------------------
			//         message:sendDocument
			// ----------------------------------
			{
				displayName: 'Document',
				name: 'file',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'sendDocument'
						],
						resource: [
							'message',
						],
					},
				},
				description: 'Document to send. Pass a file_id to send a file that exists on the Telegram servers (recommended)<br />or pass an HTTP URL for Telegram to get a file from the Internet.',
			},


			// ----------------------------------
			//         message:sendMessage
			// ----------------------------------
			{
				displayName: 'Text',
				name: 'text',
				type: 'string',
				required: true,
				typeOptions: {
					alwaysOpenEditWindow: true,
				},
				default: '',
				displayOptions: {
					show: {
						operation: [
							'editMessageText',
							'sendMessage',
						],
						resource: [
							'message',
						],
					},
				},
				description: 'Text of the message to be sent.',
			},


			// ----------------------------------
			//         message:sendPhoto
			// ----------------------------------
			{
				displayName: 'Photo',
				name: 'file',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'sendPhoto'
						],
						resource: [
							'message',
						],
					},
				},
				description: 'Photo to send. Pass a file_id to send a photo that exists on the Telegram servers (recommended)<br />or pass an HTTP URL for Telegram to get a photo from the Internet.',
			},


			// ----------------------------------
			//         message:sendSticker
			// ----------------------------------
			{
				displayName: 'Sticker',
				name: 'file',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'sendSticker'
						],
						resource: [
							'message',
						],
					},
				},
				description: 'Sticker to send. Pass a file_id to send a file that exists on the Telegram servers (recommended)<br />or pass an HTTP URL for Telegram to get a .webp file from the Internet.',
			},


			// ----------------------------------
			//         message:sendVideo
			// ----------------------------------
			{
				displayName: 'Video',
				name: 'file',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: [
							'sendVideo'
						],
						resource: [
							'message',
						],
					},
				},
				description: 'Video file to send. Pass a file_id to send a file that exists on the Telegram servers (recommended)<br />or pass an HTTP URL for Telegram to get a file from the Internet.',
			},


			// ----------------------------------
			//         message:editMessageText/sendAudio/sendMessage/sendPhoto/sendSticker/sendVideo
			// ----------------------------------

			{
				displayName: 'Reply Markup',
				name: 'replyMarkup',
				displayOptions: {
					show: {
						operation: [
							'sendDocument',
							'sendMessage',
							'sendPhoto',
							'sendSticker',
							'sendVideo',
						],
						resource: [
							'message',
						],
					},
				},
				type: 'options',
				options: [
					{
						name: 'None',
						value: 'none',
					},
					{
						name: 'Force Reply',
						value: 'forceReply',
					},
					{
						name: 'Inline Keyboard',
						value: 'inlineKeyboard',
					},
					{
						name: 'Reply Keyboard',
						value: 'replyKeyboard',
					},
					{
						name: 'Reply Keyboard Remove',
						value: 'replyKeyboardRemove',
					},
				],
				default: 'none',
				description: 'Additional interface options.',
			},

			{
				displayName: 'Force Reply',
				name: 'forceReply',
				type: 'collection',
				placeholder: 'Add Field',
				displayOptions: {
					show: {
						replyMarkup: [
							'forceReply',
						],
						resource: [
							'message',
						],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Force Reply',
						name: 'force_reply',
						type: 'boolean',
						default: false,
						description: 'Shows reply interface to the user, as if they manually selected the bot‘s message and tapped ’Reply.',
					},
					{
						displayName: 'Selective',
						name: 'selective',
						type: 'boolean',
						default: false,
						description: ' Use this parameter if you want to force reply from specific users only.',
					},
				],
			},


			{
				displayName: 'Inline Keyboard',
				name: 'inlineKeyboard',
				placeholder: 'Add Keyboard Row',
				description: 'Adds an inline keyboard that appears right next to the message it belongs to.',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						replyMarkup: [
							'inlineKeyboard',
						],
						resource: [
							'message',
						],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Rows',
						name: 'rows',
						values: [
							{
								displayName: 'Row',
								name: 'row',
								type: 'fixedCollection',
								description: 'The value to set.',
								placeholder: 'Add Button',
								typeOptions: {
									multipleValues: true,
								},
								default: {},
								options: [
									{
										displayName: 'Buttons',
										name: 'buttons',
										values: [
											{
												displayName: 'Text',
												name: 'text',
												type: 'string',
												default: '',
												description: 'Label text on the button.',
											},
											{
												displayName: 'Additional Fields',
												name: 'additionalFields',
												type: 'collection',
												placeholder: 'Add Field',
												default: {},
												options: [
													{
														displayName: 'Callback Data',
														name: 'callback_data',
														type: 'string',
														default: '',
														description: 'Data to be sent in a callback query to the bot when button is pressed, 1-64 bytes.',
													},
													{
														displayName: 'Pay',
														name: 'pay',
														type: 'boolean',
														default: false,
														description: 'Specify True, to send a Pay button.',
													},
													{
														displayName: 'Switch Inline Query Current Chat',
														name: 'switch_inline_query_current_chat',
														type: 'string',
														default: '',
														description: 'If set, pressing the button will insert the bot‘s username and the specified<br />inline query in the current chat\'s input field.Can be empty, in which case only the<br />bot’s username will be inserted.',
													},
													{
														displayName: 'Switch Inline Query',
														name: 'switch_inline_query',
														type: 'string',
														default: '',
														description: 'If set, pressing the button will prompt the user to select one of their chats<br />, open that chat and insert the bot‘s username and the specified inline query in the<br />input field. Can be empty, in which case just the bot’s username will be inserted.',
													},
													{
														displayName: 'URL',
														name: 'url',
														type: 'string',
														default: '',
														description: 'HTTP or tg:// url to be opened when button is pressed.',
													},
												],
											},
										],
									},
								],
							},
						],
					},
				],
			},

			{
				displayName: 'Reply Keyboard',
				name: 'replyKeyboard',
				placeholder: 'Add Reply Keyboard Row',
				description: 'Adds a custom keyboard with reply options.',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						replyMarkup: [
							'replyKeyboard',
						],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Rows',
						name: 'rows',
						values: [
							{
								displayName: 'Row',
								name: 'row',
								type: 'fixedCollection',
								description: 'The value to set.',
								placeholder: 'Add Button',
								typeOptions: {
									multipleValues: true,
								},
								default: {},
								options: [
									{
										displayName: 'Buttons',
										name: 'buttons',
										values: [
											{
												displayName: 'Text',
												name: 'text',
												type: 'string',
												default: '',
												description: 'Text of the button. If none of the optional fields are used, it will be sent as a message when the button is pressed.',
											},
											{
												displayName: 'Additional Fields',
												name: 'additionalFields',
												type: 'collection',
												placeholder: 'Add Field',
												default: {},
												options: [
													{
														displayName: 'Request Contact',
														name: 'request_contact',
														type: 'boolean',
														default: false,
														description: 'If True, the user\'s phone number will be sent as a contact when the button is pressed.Available in private chats only.',
													},
													{
														displayName: 'Request Location',
														name: 'request_location',
														type: 'boolean',
														default: false,
														description: 'If True, the user\'s request_location.',
													},
												],
											},
										],
									},
								],
							},
						],
					},
				],
			},

			{
				displayName: 'Reply Keyboard Options',
				name: 'replyKeyboardOptions',
				type: 'collection',
				placeholder: 'Add Option',
				displayOptions: {
					show: {
						replyMarkup: [
							'replyKeyboard',
						],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Resize Keyboard',
						name: 'resize_keyboard',
						type: 'boolean',
						default: false,
						description: 'Requests clients to resize the keyboard vertically for optimal fit.',
					},
					{
						displayName: 'One Time Keyboard',
						name: 'one_time_keyboard',
						type: 'boolean',
						default: false,
						description: 'Requests clients to hide the keyboard as soon as it\'s been used.',
					},
					{
						displayName: 'Selective',
						name: 'selective',
						type: 'boolean',
						default: false,
						description: 'Use this parameter if you want to show the keyboard to specific users only.',
					},
				],
			},

			{
				displayName: 'Reply Keyboard Remove',
				name: 'replyKeyboardRemove',
				type: 'collection',
				placeholder: 'Add Field',
				displayOptions: {
					show: {
						replyMarkup: [
							'replyKeyboardRemove',
						],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Remove Keyboard',
						name: 'remove_keyboard',
						type: 'boolean',
						default: false,
						description: 'Requests clients to remove the custom keyboard.',
					},
					{
						displayName: 'Selective',
						name: 'selective',
						type: 'boolean',
						default: false,
						description: ' Use this parameter if you want to force reply from specific users only.',
					},
				],
			},

			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				displayOptions: {
					show: {
						operation: [
							'editMessageText',
							'sendDocument',
							'sendMessage',
							'sendPhoto',
							'sendSticker',
							'sendVideo',
						],
						resource: [
							'message',
						],
					},
				},
				default: {},
				options: [
					{
						displayName: 'Caption',
						name: 'caption',
						type: 'string',
						typeOptions: {
							alwaysOpenEditWindow: true,
						},
						displayOptions: {
							show: {
								'/operation': [
									'sendAudio',
									'sendDocument',
									'sendPhoto',
									'sendVideo',
								],
							},
						},
						default: '',
						description: 'Caption text to set, 0-1024 characters.',
					},
					{
						displayName: 'Disable Notification',
						name: 'disable_notification',
						type: 'boolean',
						default: false,
						displayOptions: {
							hide: {
								'/operation': [
									'editMessageText',
								],
							},
						},
						description: 'Sends the message silently. Users will receive a notification with no sound.',
					},
					{
						displayName: 'Disable WebPage Preview',
						name: 'disable_web_page_preview',
						type: 'boolean',
						displayOptions: {
							show: {
								'/operation': [
									'editMessageText',
									'sendMessage',
								],
							},
						},
						default: false,
						description: 'Disables link previews for links in this message.',
					},
					{
						displayName: 'Duration',
						name: 'duration',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						displayOptions: {
							show: {
								'/operation': [
									'sendAudio',
									'sendVideo',
								],
							},
						},
						default: 0,
						description: 'Duration of clip in seconds.',
					},
					{
						displayName: 'Height',
						name: 'height',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						displayOptions: {
							show: {
								'/operation': [
									'sendVideo',
								],
							},
						},
						default: 0,
						description: 'Height of the video.',
					},
					{
						displayName: 'Parse Mode',
						name: 'parse_mode',
						type: 'options',
						options: [
							{
								name: 'Markdown',
								value: 'Markdown',
							},
							{
								name: 'HTML',
								value: 'HTML',
							},
						],
						displayOptions: {
							show: {
								'/operation': [
									'editMessageText',
									'sendAudio',
									'sendMessage',
									'sendPhoto',
									'sendVideo',
								],
							},
						},
						default: 'HTML',
						description: 'How to parse the text.',
					},
					{
						displayName: 'Performer',
						name: 'performer',
						type: 'string',
						displayOptions: {
							show: {
								'/operation': [
									'sendAudio',
								],
							},
						},
						default: '',
						description: 'Name of the performer.',
					},
					{
						displayName: 'Reply To Message ID',
						name: 'reply_to_message_id',
						type: 'number',
						displayOptions: {
							hide: {
								'/operation': [
									'editMessageText',
								],
							},
						},
						default: 0,
						description: 'If the message is a reply, ID of the original message.',
					},
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						typeOptions: {
							alwaysOpenEditWindow: true,
						},
						displayOptions: {
							show: {
								'/operation': [
									'sendAudio',
								],
							},
						},
						default: '',
						description: 'Title of the track.',
					},
					{
						displayName: 'Thumbnail',
						name: 'thumb',
						type: 'string',
						displayOptions: {
							show: {
								'/operation': [
									'sendAudio',
									'sendDocument',
									'sendVideo',
								],
							},
						},
						default: '',
						description: 'Thumbnail of the file sent; can be ignored if thumbnail generation<br />for the file is supported server-side. The thumbnail should be in<br />JPEG format and less than 200 kB in size. A thumbnail‘s<br />width and height should not exceed 320.',
					},
					{
						displayName: 'Width',
						name: 'width',
						type: 'number',
						typeOptions: {
							minValue: 0,
						},
						displayOptions: {
							show: {
								'/operation': [
									'sendVideo',
								],
							},
						},
						default: 0,
						description: 'Width of the video.',
					},
				],
			},

		],
	};


	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];

		// For Post
		let body: IDataObject;
		// For Query string
		let qs: IDataObject;

		let requestMethod: string;
		let endpoint: string;

		const operation = this.getNodeParameter('operation', 0) as string;
		const resource = this.getNodeParameter('resource', 0) as string;

		for (let i = 0; i < items.length; i++) {
			// Reset all values
			requestMethod = 'POST';
			endpoint = '';
			body = {};
			qs = {};

			if (resource === 'callback') {
				if (operation === 'answerQuery') {
					// ----------------------------------
					//         callback:answerQuery
					// ----------------------------------

					endpoint = 'answerCallbackQuery';

					body.callback_query_id = this.getNodeParameter('queryId', i) as string;

					// Add additional fields
					const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
					Object.assign(body, additionalFields);

				}
			} else if (resource === 'chat') {
				if (operation === 'get') {
					// ----------------------------------
					//         chat:get
					// ----------------------------------

					endpoint = 'getChat';

					body.chat_id = this.getNodeParameter('chatId', i) as string;

				} else if (operation === 'leave') {
					// ----------------------------------
					//         chat:leave
					// ----------------------------------

					endpoint = 'leaveChat';

					body.chat_id = this.getNodeParameter('chatId', i) as string;

				} else if (operation === 'member') {
					// ----------------------------------
					//         chat:member
					// ----------------------------------

					endpoint = 'getChatMember';

					body.chat_id = this.getNodeParameter('chatId', i) as string;
					body.user_id = this.getNodeParameter('userId', i) as string;

				} else if (operation === 'setDescription') {
					// ----------------------------------
					//         chat:setDescription
					// ----------------------------------

					endpoint = 'setChatDescription';

					body.chat_id = this.getNodeParameter('chatId', i) as string;
					body.description = this.getNodeParameter('description', i) as string;

				} else if (operation === 'setTitle') {
					// ----------------------------------
					//         chat:setTitle
					// ----------------------------------

					endpoint = 'setChatTitle';

					body.chat_id = this.getNodeParameter('chatId', i) as string;
					body.title = this.getNodeParameter('title', i) as string;

				}

			} else if (resource === 'message') {

				if (operation === 'editMessageText') {
					// ----------------------------------
					//         message:editMessageText
					// ----------------------------------

					endpoint = 'editMessageText';

					const messageType = this.getNodeParameter('messageType', i) as string;

					if (messageType === 'inlineMessage') {
						body.inline_message_id = this.getNodeParameter('inlineMessageId', i) as string;
					} else {
						body.chat_id = this.getNodeParameter('chatId', i) as string;
						body.message_id = this.getNodeParameter('messageId', i) as string;
					}

					body.text = this.getNodeParameter('text', i) as string;

					// Add additional fields and replyMarkup
					addAdditionalFields.call(this, body, i);

				} else if (operation === 'sendAudio') {
					// ----------------------------------
					//         message:sendAudio
					// ----------------------------------

					endpoint = 'sendAudio';

					body.chat_id = this.getNodeParameter('chatId', i) as string;
					body.audio = this.getNodeParameter('file', i) as string;

					// Add additional fields and replyMarkup
					addAdditionalFields.call(this, body, i);

				} else if (operation === 'sendChatAction') {
					// ----------------------------------
					//         message:sendChatAction
					// ----------------------------------

					endpoint = 'sendChatAction';

					body.chat_id = this.getNodeParameter('chatId', i) as string;
					body.action = this.getNodeParameter('action', i) as string;

				} else if (operation === 'sendDocument') {
					// ----------------------------------
					//         message:sendDocument
					// ----------------------------------

					endpoint = 'sendDocument';

					body.chat_id = this.getNodeParameter('chatId', i) as string;
					body.document = this.getNodeParameter('file', i) as string;

					// Add additional fields and replyMarkup
					addAdditionalFields.call(this, body, i);

				} else if (operation === 'sendMessage') {
					// ----------------------------------
					//         message:sendMessage
					// ----------------------------------

					endpoint = 'sendMessage';

					body.chat_id = this.getNodeParameter('chatId', i) as string;
					body.text = this.getNodeParameter('text', i) as string;

					// Add additional fields and replyMarkup
					addAdditionalFields.call(this, body, i);

				} else if (operation === 'sendPhoto') {
					// ----------------------------------
					//         message:sendPhoto
					// ----------------------------------

					endpoint = 'sendPhoto';

					body.chat_id = this.getNodeParameter('chatId', i) as string;
					body.photo = this.getNodeParameter('file', i) as string;

					// Add additional fields and replyMarkup
					addAdditionalFields.call(this, body, i);

				} else if (operation === 'sendSticker') {
					// ----------------------------------
					//         message:sendSticker
					// ----------------------------------

					endpoint = 'sendSticker';

					body.chat_id = this.getNodeParameter('chatId', i) as string;
					body.sticker = this.getNodeParameter('file', i) as string;

					// Add additional fields and replyMarkup
					addAdditionalFields.call(this, body, i);

				} else if (operation === 'sendVideo') {
					// ----------------------------------
					//         message:sendVideo
					// ----------------------------------

					endpoint = 'sendVideo';

					body.chat_id = this.getNodeParameter('chatId', i) as string;
					body.video = this.getNodeParameter('file', i) as string;

					// Add additional fields and replyMarkup
					addAdditionalFields.call(this, body, i);

				}
			} else {
				throw new Error(`The resource "${resource}" is not known!`);
			}

			const responseData = await apiRequest.call(this, requestMethod, endpoint, body, qs);
			returnData.push(responseData);
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
