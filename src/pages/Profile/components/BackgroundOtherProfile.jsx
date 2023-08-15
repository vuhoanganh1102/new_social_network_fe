import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Tippy from '@tippyjs/react/headless'

import { FaUserCheck } from 'react-icons/fa'
import { BiUserX } from 'react-icons/bi'
import { FiUserX } from 'react-icons/fi'
import { BsMessenger } from 'react-icons/bs'
import { HiUserAdd } from 'react-icons/hi'
import { ClipLoader } from 'react-spinners'
import Image from '../../../components/Image/Image'
import Avatar from '../../../components/Avatar/Avatar'
import coverPic from '../../../assets/imgs/coverPic.jpg'
import Button from '../../../components/Button/Button'

import { AuthContext } from '../../../contexts/AuthContext'
import userApi from '../../../api/userApi'
import { SocketContext } from '../../../contexts/SocketContext'
import OutsideClickWrapper from '../../../components/OutsideClickWrapper'
import ChatCard from '../../../components/ChatCard/ChatCard'
import chatApi from '../../../api/chatApi'

const BackgroundOtherProfile = ({ currentUser }) => {
  const { socket } = useContext(SocketContext)
  const { user, dispatch } = useContext(AuthContext)
  const [showDeleteFriend, setShowDeleteFriend] = useState(false)
  const [showChatCard, setShowChatCard] = useState(false)
  const [currentChat, setCurrentChat] = useState()
  const [showMenu, setShowMenu] = useState(false)
  const [newMessage, setNewMessage] = useState()
  const [isLoadingCalculateMutualFriends, setIsLoadingCalculateMutualFriends] = useState(false)


  const isFriend = user?.friends?.some((item) => {
    return item?.id === currentUser?.id
  })

  const isSentRequest = user?.friendRequestsSent?.some((item) => {
    return item?.id === currentUser?.id
  })

  const isReceiveRequest = user?.friendRequests?.some((item) => {
    return item?.id === currentUser?.id
  })

  const handleSendFriendRequest = async (myId, friendId) => {
    try {
      const data = {
        userId: myId,
        friendId: friendId,
      }
      const res = await userApi.sendFriendRequest(data)
      socket.emit('sendFriendRequest', { user: res?.data?.sender, friendSend: res?.data?.receiver })

      dispatch({
        type: 'UPDATE_PROPERTY_USER',
        payload: {
          key: 'friendRequestsSent',
          value: res?.data?.sender?.friendRequestsSent,
        },
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleAcceptFriendRequest = async (myId, friendId) => {
    const data = {
      userId: myId,
      friendId: friendId,
    }
    const res = await userApi.sendFriendAccept(data)
    socket.emit('acceptFriendRequest', { user: res?.data?.senderAccept, friendAccepted: res?.data?.receiverAccept })
    dispatch({
      type: 'UPDATE_PROPERTY_USER',
      payload: {
        key: 'friendRequests',
        value: res?.data?.senderAccept?.friendRequests,
      },
    })
    dispatch({
      type: 'UPDATE_PROPERTY_USER',
      payload: {
        key: 'friends',
        value: res?.data?.senderAccept?.friends,
      },
    })
  }

  const handleCancelFriendRequest = async (myId, friendId) => {
    const data = {
      userId: myId,
      friendId: friendId,
    }
    const res = await userApi.cancelFriendRequest(data)
    socket.emit('cancelSentFriendRequest', { user: res?.data?.sender, friendRequest: res?.data?.receiver })
    dispatch({
      type: 'UPDATE_PROPERTY_USER',
      payload: {
        key: 'friendRequestsSent',
        value: res?.data?.sender?.friendRequestsSent,
      },
    })
  }

  const handleDeleteFriend = async (myId, friendId) => {
    const data = {
      userId: myId,
      friendId: friendId,
    }
    const res = await userApi.deleteFriend(data)
    setShowDeleteFriend(false)
    dispatch({
      type: 'UPDATE_PROPERTY_USER',
      payload: {
        key: 'friends',
        value: res?.data?.sender?.friends,
      },
    })
  }

  const handleOpenChatWithFriend = async (friendId) => {
    setShowChatCard(true)
    const res = await chatApi.getChatByUserId({
      params: {
        userId: friendId
      }
    })
    // console.log(res)
    socket.emit("joinChat", res?.data?.chat?.id)
    setCurrentChat(res?.data?.chat)

  }
  useEffect(() => {
    socket.on("notijoinchat", (data) => {
      // console.log(data)
    })
    socket.on("isTyping", (data) => {
      console.log(data)
    })
    socket.on("stopTyping", (data) => {
      // console.log(data)
    })
    socket.on("receiveMessage", (data) => {
      setNewMessage(data?.message)
      // console.log(data)
    })
  }, [])

  useEffect(() => {
    if (!showChatCard) {
      setCurrentChat()
    }
  }, [showChatCard])


  const myMutualFriends = useMemo(() => {
    if (!user.friends) {
      return []
    }
    if (user.id === user.id) {
      return []
    }
    const mutualFriends = []
    if (user) {
      for (const myFriend of user.friends) {
        for (const yourFriend of user?.friends) {
          if (myFriend.id === yourFriend.id) {
            mutualFriends.push(myFriend)
          }
        }
      }
    }

    return mutualFriends
  }, [user])


  const mutualFriends = useMemo(() => {
    setIsLoadingCalculateMutualFriends(true)
    const newMutualFriends = []
    if (user.friends) {
      const currentFriend = user.friends.find((friend) => friend.id === currentUser?.id)
      if (currentFriend) {
        for (const userIdFriend of currentFriend.friends) {
          for (const myFriend of user.friends) {
            if (userIdFriend === myFriend.id) {
              newMutualFriends.push(myFriend)
            }
          }
        }
      }
    }
    setIsLoadingCalculateMutualFriends(false)
    return newMutualFriends
  }, [currentUser?.id, user])
  // console.log(mutualFriends)

  const renderPreview = (myFriend) => {
    const isFriend = user?.friends?.some((item) => item?.id === myFriend.id)
    return (
      <div className="hidden laptop:block laptop:w-[350px] border border-borderColor rounded-xl bg-white px-5 py-5">
        <div className="flex">
          <Avatar user={myFriend} className="w-20 h-20 border rounded-full" />
          <div className="flex flex-col ml-5">
            <h1 className="mb-2 text-xl font-bold">{myFriend?.fullName}</h1>
            {!isLoadingCalculateMutualFriends && mutualFriends.length > 0 && (
              <span>Có {mutualFriends.length} bạn chung</span>
            )}
            <p>Giới tính: {myFriend?.gender === 'male' ? 'Nam' : myFriend?.gender === 'female' ? 'Nữ' : 'Khác'}</p>

          </div>
        </div>
        <div className="flex items-center justify-end mt-4">
          {isFriend && (
            <Button type="button" className="text-white px-3 py-1.5 bg-primary rounded-xl mx-3">
              Bạn bè{' '}
            </Button>

          )}
          {myFriend?.id !== user?.id && (
            <Button
              type="button"
              className="text-black px-3 py-1.5 rounded-xl bg-bgColor"
              onClick={() => handleOpenChatWithFriend(myFriend?.id)}
            >
              Nhắn tin{' '}
            </Button>
          )}
        </div>
      </div>
    )
  }



  return (
    <>
      <div className="p-4 bg-white mb-7 rounded-2xl">
        <div>
          <Image
            className="h-[348px] w-full rounded-2xl pointer-events-none"
            src={currentUser?.background?.url || coverPic}
          />
        </div>
        <div className="relative flex justify-between">
          <Avatar
            user={currentUser}
            className="absolute opacity-100 w-[168px] h-[168px] object-cover left-8 -translate-y-1/3"
          />
          <div className="flex flex-col ml-[220px]">
            <h3 className="text-4xl font-bold  translate-y-5">{currentUser?.fullName}</h3>
            {!isLoadingCalculateMutualFriends && mutualFriends.length > 0 && (
              <span className="mt-6 mb-3">{mutualFriends.length} Bạn chung</span>
            )}
            <div className="flex items-center">
              {!isLoadingCalculateMutualFriends && mutualFriends.length > 0 && mutualFriends.map((item, index) => (
                <Tippy key={item?.id} render={() => renderPreview(item)} tabIndex={index} interactive placement="bottom-start">
                  <div className="">
                    <Avatar user={item} className={`w-10 h-10 `} />

                  </div>
                </Tippy>
              ))}
            </div>
          </div>

          <div className="flex pt-10">
            {isSentRequest && (
              <Button
                className="mx-1.5 text-white bg-primary rounded-xl hover:opacity-80"
                onClick={() => handleCancelFriendRequest(user?.id, currentUser?.id)}
              >
                <span className="mr-2">
                  <FiUserX />
                </span>
                Huỷ lời mời
              </Button>
            )}
            {isReceiveRequest && (
              <Button
                className="mx-1.5 text-black bg-hoverColor rounded-xl hover:opacity-80"
                onClick={() => handleAcceptFriendRequest(user?.id, currentUser?.id)}
              >
                <span className="flex items-center mr-2">
                  <HiUserAdd fontSize={24} />
                </span>
                Chấp nhận kết bạn
              </Button>
            )}
            {!isFriend && !isSentRequest && !isReceiveRequest && (
              <Button
                className="flex items-center mx-1.5 bg-primary rounded-xl hover:opacity-80"
                onClick={() => handleSendFriendRequest(user?.id, currentUser?.id)}
              >
                <span className="flex items-center mr-2">
                  <HiUserAdd fontSize={24} />
                </span>
                Kết bạn
              </Button>
            )}

            {isFriend && (
              <OutsideClickWrapper onClickOutside={() => setShowDeleteFriend(false)}>
                <div className="relative">
                  <Button
                    className="mx-1.5 text-black bg-hoverColor rounded-xl hover:opacity-80"
                    onClick={() => setShowDeleteFriend((pre) => !pre)}
                  >
                    <span className="flex items-center mr-2">
                      <FaUserCheck /> <p className="ml-2.5">Bạn bè</p>
                    </span>
                  </Button>
                  {showDeleteFriend && (
                    <div className="absolute top-[100%] w-[200px] border border-borderColor rounded-md p-1.5 shadow-xl bg-white">
                      <div
                        className="p-2 hover:bg-hoverColor cursor-pointer flex items-center"
                        onClick={() => handleDeleteFriend(user.id, currentUser.id)}
                      >
                        <span className="mr-2">
                          <BiUserX fontSize={22} />
                        </span>
                        Hủy kết bạn
                      </div>
                    </div>
                  )}
                </div>
              </OutsideClickWrapper>
            )}

            <div>
              <Button
                className="mx-1.5 text-black bg-hoverColor rounded-xl hover:opacity-80 "
                onClick={() => handleOpenChatWithFriend(currentUser?.id)}
              >
                <span className="flex items-center mr-2">
                  <BsMessenger />{' '}
                </span>{' '}
                Nhắn tin
              </Button>
            </div>
          </div>
        </div>
        <div className="pt-2 mt-12 border-t-2 border-borderColor">
          <ul className="flex">
            <Link to={`/profile/${currentUser?.id}`} className="px-1.5 tablet:px-4 py-1.5 tablet:py-3 rounded-xl cursor-pointer hover:bg-hoverColor ">
              <p className="text-base tablet:text-lg text-black font-medium">Bài viết</p>
            </Link>
            <Link to={`/profile/${currentUser?.id}/friends`} className="px-1.5 tablet:px-4 py-1.5 tablet:py-3 rounded-xl cursor-pointer hover:bg-hoverColor ">
              <p className="text-base tablet:text-lg text-black font-medium">Bạn bè</p>
            </Link>

          </ul>
        </div>
        {showChatCard && (
          <ChatCard
            currentChat={currentChat}
            showChatCard={showChatCard}
            setShowChatCard={setShowChatCard}
            newMessage={newMessage}
          />
        )}
      </div>

    </>
  )
}

export default BackgroundOtherProfile
