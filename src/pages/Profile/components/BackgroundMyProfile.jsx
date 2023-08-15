import React, { useContext, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import Tippy from '@tippyjs/react/headless'
import { BsFillCameraFill } from 'react-icons/bs'
import { FaPen } from 'react-icons/fa'
import { ClipLoader } from 'react-spinners'
import { AuthContext } from '../../../contexts/AuthContext'
import Image from '../../../components/Image/Image'
import Avatar from '../../../components/Avatar/Avatar'
import coverPic from '../../../assets/imgs/coverPic.jpg'
import Button from '../../../components/Button/Button'
import MyModal from '../../../components/MyModal/MyModal'
import ModalUpdateAvatar from '../../../components/ModalUpdateAvatar/ModalUpdateAvatar'
import userApi from '../../../api/userApi'
import ListFriend from '../../ListFriend/ListFriend'
import ProtectedRoute from '../../../routes/ProtectedRoute'
import config from '../../../config'
const BackgroundMyProfile = () => {
  const [isOpenModalUpdateAvatar, setIsOpenModalUpdateAvatar] = useState(false)
  const [bgPreview, setBgPreview] = useState('')
  const [isOpenBtnUpdateBackground, setIsOpenBtnUpdateBackground] = useState(false)
  const [file, setFile] = useState()
  const [loading, setLoading] = useState(false)
  const { user, dispatch } = useContext(AuthContext)

  const handleOpenModalUpdateAvatar = () => {
    setIsOpenModalUpdateAvatar((prev) => !prev)
  }
  const handleCloseModalUpdateAvatar = () => {
    setIsOpenModalUpdateAvatar((prev) => !prev)
  }

  const handlePreviewBackground = (e) => {
    const file = e.target.files[0]
    setFile(file)
    setBgPreview(URL.createObjectURL(file))
  }
  const handleCancelUpdateBackground = () => {
    setBgPreview("")
    setIsOpenBtnUpdateBackground(false)
  }
  const handleUpdateBackground = async () => {
    setLoading(true)
    try {
      const data = new FormData()
      if (file) {
        data.append("background", file)
        const res = await userApi.updateBackground(data)
        if (res?.data?.success) {
          setIsOpenBtnUpdateBackground((prev) => !prev)
          dispatch({ type: 'UPDATE_USER', payload: res?.data?.user })
          setLoading(false)
          setBgPreview("")

        }
      }
    } catch (error) {

    }
  }
  const renderPreview = (myFriend) => {
    const isFriend = user?.friends?.some((item) => item?.id === myFriend.id)
    // console.log(myFriend)
    // console.log(123)
    return (
      <div className="hidden laptop:block laptop:w-[350px] border border-borderColor rounded-xl bg-white px-5 py-5">
        <div className="flex">
          <Avatar user={myFriend} className="w-20 h-20 border rounded-full" />
          <div className="flex flex-col ml-5">
            <h1 className="mb-2 text-xl font-bold">{myFriend?.fullName}</h1>
            {/* {!isLoadingCalculateMutualFriends && mutualFriends.length > 0 && (
              <span>Có {mutualFriends.length} bạn chung</span>
            )} */}
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

      <div className="mb-0 tablet:mb-7 p-4 bg-white rounded-none tablet:rounded-2xl">
        <div className="relative">

          {bgPreview ? (
            <Image className="h-[150px] tablet:h-[408px] w-full rounded-2xl pointer-events-none" src={bgPreview} />
          ) : (
            <Image className="h-[150px] tablet:h-[408px] w-full rounded-2xl pointer-events-none" src={user?.background?.url || coverPic} />

          )}

          <form>
            <label htmlFor="file2">
              <div
                className="absolute flex items-center cursor-pointer top-1  tablet:top-5 right-1 tablet:right-8 px-1 tablet:px-3 py-1 tablet:py-2 rounded-xl bg-borderColor hover:opacity-90"
              >
                <span className="ml-1 text-sm tablet:text-[18px] font-normal">
                  Cập nhật ảnh bìa
                </span>
              </div>
              <input
                style={{ display: "none" }}
                type="file"
                id="file2"
                name="file2"
                accept=".png,.jpeg,.jpg"
                onChange={handlePreviewBackground}
              />
            </label>
          </form>
          {bgPreview && (
            <div className="flex items-center absolute bottom-4 right-4">
              <Button
                type="button"
                className='bg-hoverColor rounded-lg mx-2 text-black px-5 py-1.5'
                onClick={handleCancelUpdateBackground}
              >
                Huỷ
              </Button>
              <Button
                type="button"
                className="bg-borderColor rounded-lg mx-2 text-black px-5 py-1.5"
                onClick={handleUpdateBackground}
              >
                {loading ? (
                  <ClipLoader />
                ) : "Cập nhật"}
              </Button>
            </div>
          )}
        </div>
        <div className="flex-col tablet:flex tablet:flex-row justify-between relative">
          <Avatar user={user} className="absolute opacity-100 w-[100px] tablet:w-[168px] h-[100px] tablet:h-[168px] object-cover left-0 tablet:left-8 -translate-y-1/3" />
          <span
            className="absolute top-9  left-20 tablet:left-44 border-white cursor-pointer p-1.5 rounded-full bg-hoverColor flex items-center justify-center"
            onClick={handleOpenModalUpdateAvatar}
          >
            <BsFillCameraFill className="" fontSize={24} />
          </span>
          <div className="flex flex-col ml-[240px]">
            <h3
              className="text-4xl font-bold  translate-y-5"
            >
              {user?.fullName}
            </h3>
            {user?.friends.length > 0 && (
              <Link to={`/profile/${user?.id}/friends`} className="mt-6 mb-3 hover:underline">
                <span className="mt-6 mb-3">{user?.friends.length} Bạn bè </span>
              </Link>
            )}
            <div className="flex items-center">
              {user?.friends.length > 0 && user?.friends.slice(0, 8).map((item, index) => (
                <Tippy key={item?.id} render={() => renderPreview(item)} tabIndex={index} interactive placement="bottom-start">
                  <div className="">
                    <Avatar user={item} className={`w-10 h-10`} />

                  </div>
                </Tippy>
              ))}
            </div>
          </div>
          <div>
            <Link to='/me' className="flex pt-5 tablet:pt-10 justify-center">
              <Button className="bg-hoverColor text-black rounded-xl text-base mt-5 tablet:text-xl">
                <FaPen className="mr-2" fontSize={20} />
                Chỉnh sửa thông tin cá nhân
              </Button>
            </Link>
          </div>
        </div>
        <ModalUpdateAvatar
          isOpen={isOpenModalUpdateAvatar}
          setIsOpen={setIsOpenModalUpdateAvatar}
          handleClose={handleCloseModalUpdateAvatar}
        />
        <div className="mt-5 tablet:mt-12 pt-2 border-t border-borderColor">
          <ul className="flex justify-between tablet:justify-start">
            <Link to={`/profile/${user?.id}`} className="px-1.5 tablet:px-4 py-1.5 tablet:py-3 rounded-xl cursor-pointer hover:bg-hoverColor ">
              <p className="text-base tablet:text-lg text-black font-medium">Bài viết</p>
            </Link>
            <Link to={`/profile/${user?.id}/friends`} className="px-1.5 tablet:px-4 py-1.5 tablet:py-3 rounded-xl cursor-pointer hover:bg-hoverColor ">
              <p className="text-base tablet:text-lg text-black font-medium">Bạn bè</p>
            </Link>

          </ul>
        </div>
      </div>
    </>
  )
}

export default BackgroundMyProfile
