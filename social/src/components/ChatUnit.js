import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import { useEffect, useState } from 'react'
import { sendMessage } from '../api/socketManager'
import { setCurrentChat, setCurrentChatContent } from '../features/chatSlice';
import { useDispatch, useSelector } from 'react-redux'
import Divider from '@mui/material/Divider';
import ListItemButton from '@mui/material/ListItemButton';



const ChatUnit = ({ user, friend, isSelected, onSelect }) => {
    const dispatch = useDispatch()
    const [userHasInteracted, setUserHasInteracted] = useState(false);
    const [chatContent, setChatContent] = useState([])
    const [chatId, setChatId] = useState(null)
    const [chatUpdate, setChatUpdate] = useState(false)
    const [loading, setLoading] = useState(true);
    const [dataFetched, setDataFetched] = useState(false);
    const [lastMessage, setLastMessage] = useState({
        userId: null,
        content: null,
        created_at: null
    })
    const chatContentSelector = useSelector(state => state.chat.currentChatContent)
    const currentChat = useSelector(state => state.chat.currentChat)
    useEffect(() => {
        dispatch(setCurrentChat(null));
        sendMessage('checkChats', { userId: user._id, friendId: friend._id }, (response) => {
            
            if (response.data.users.some(user => user._id == friend._id))
                if (response.success) {

                    if (userHasInteracted)
                        setChatId(response.data);

                    if (response.data?.messages.length >= 1) {
              
                        const { userId, content, created_at } = response.data.messages[response.data.messages.length - 1];
                        setChatContent(response.data.messages);
                        setLastMessage({ userId, content, created_at });


                    }
                    setDataFetched(true);


                }

        });

        setLoading(false);
    }, [chatUpdate, userHasInteracted]);

    useEffect(() => {
        if (dataFetched && chatId) {
            dispatch(setCurrentChat(chatId));
            dispatch(setCurrentChatContent(chatContent));
            setDataFetched(false);
        }
    }, [dataFetched, chatId, chatContent, dispatch]);
    const handleClick = () => {
        setUserHasInteracted(true);
        setChatUpdate(prev => !prev);
        onSelect();
    };




    return (

        <ListItem key={friend._id} alignItems="flex-start" onClick={() => handleClick()} style={{ backgroundColor: isSelected ? 'lightgray' : 'transparent', borderRadius: '10px' }} >

            <ListItemAvatar >
                <Avatar alt={friend.name} src={friend.avatar} />
            </ListItemAvatar>
            <ListItemText
                primary={friend.name}
                secondary={

                    <>

                        <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                        >

                            {lastMessage.userId === null ? "" : friend.name}
                        </Typography>
                        {lastMessage.userId === null ? "Start a chat with " + friend.name : " : " + lastMessage.content}

                    </>

                }
            />

        </ListItem>

    )
}
export default ChatUnit;