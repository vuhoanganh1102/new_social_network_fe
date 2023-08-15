import React, { useContext, useEffect, useState } from 'react'
import { AiTwotoneHome, AiTwotoneHeart, AiOutlineClose } from 'react-icons/ai'
import { MdLocationOn, MdRssFeed } from 'react-icons/md'
import { FaUserAlt } from 'react-icons/fa'
import { BsGlobeAmericas, BsClockFill } from 'react-icons/bs'
import { BiWorld } from 'react-icons/bi'
import Button from '../../../components/Button/Button'
import { AuthContext } from '../../../contexts/AuthContext'
import MyModal from '../../../components/MyModal/MyModal'
import Image from '../../../components/Image/Image'
import bgHobby from '../../../assets/imgs/bgHobby.png'
import hobbyApi from '../../../api/hobbyApi'
import { toast } from 'react-toastify'
import userApi from '../../../api/userApi'

const InfoMyProfile = () => {
  const [bio, setBio] = useState()
  const [isOpenModalAddHobbies, setIsOpenModalAddHobbies] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [listHobbies, setListHobbies] = useState([])
  const [listHobbyChoosen, setListHobbyChoosen] = useState([])
  const [hobbyUser, setHobbyUser] = useState([])
  const { user, dispatch } = useContext(AuthContext)

  const handleAddBio = () => {
    setBio(user.bio)
    setShowMenu((prev) => !prev)
  }
  const handleAddHobbies = () => {
    setListHobbyChoosen(hobbyUser.map((item) => item.id))
    setIsOpenModalAddHobbies((prev) => !prev)
  }
  const handleCloseModalAddHobbies = () => {
    setIsOpenModalAddHobbies((prev) => !prev)
  }
  const fetchAllHobby = async () => {
    const res = await hobbyApi.getAllHobby()
    setListHobbies(res?.data?.hobbies)
  }
  const handleAddBobby = (hId) => {
    if (!listHobbyChoosen.includes(hId)) {
      setListHobbyChoosen((prev) => [...prev, hId])
    } else {
      const newListHobby = listHobbyChoosen.filter((item) => item !== hId)
      setListHobbyChoosen(newListHobby)
    }
  }
  const fetchHobbyUser = async () => {
    const res = await hobbyApi.getHobbiesUser({
      params: {
        userId: user.id,
      },
    })
    setHobbyUser(res?.data?.hobbies)
  }
  const handleSaveMyHobbies = async () => {
    try {
      const res = await hobbyApi.updateHobbiesUser(listHobbyChoosen)
      setHobbyUser(res.data.hobbies)
      toast.success('Cập nhật sở thích thành công')
    } catch (error) {
      toast.error('Cập nhật sở thích thất bại, Vui lòng thử lại sau')
    }
    setIsOpenModalAddHobbies(false)
  }
  useEffect(() => {
    fetchAllHobby()
    fetchHobbyUser()
  }, [])

  const handleUpdateBio = async () => {
    try {
      const res = await userApi.updateUser({
        bio,
      })
      dispatch({
        type: 'UPDATE_USER',
        payload: res?.data?.user,
      })
      toast.success('Cập nhật tiểu sử thành công')
    } catch (error) {
      let errorMessage
      if (error.response.data.message) {
        errorMessage = error.response.data.message
      } else {
        if (user.bio) {
          errorMessage = 'Cập nhật tiểu sử thất bại, Vui lòng thử lại sau'
        } else {
          errorMessage = 'Thêm tiểu sử thất bại, Vui lòng thử lại sau'
        }
      }
      toast.error(errorMessage)
    }
    setShowMenu(false)
  }

  const date = new Date(user.createdAt)
  return (
    <div className="flex flex-col p-1 tablet:p-5 bg-white border rounded-none tablet:rounded-2xl border-borderColor">
      <strong className="hidden tablet:block text-[26px] font-semibold">Giới thiệu</strong>

      {showMenu ? (
        <div className="mt-5">
          <label>
            <textarea
              className="outline-none border-[1px] border-primary text-lg w-full rounded-lg text-center px-4 py-2"
              rows="4"
              cols="50"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Mô tả về bạn"
            ></textarea>
          </label>
          <div className="flex items-center justify-between py-2 mt-2">
            <div className="flex items-center text-lg">
              <BiWorld fontSize={23} />
              <span className="py-2 ml-2 font-medium">Công khai</span>
            </div>
            <div className="flex mt-2 text-lg">
              <Button
                onClick={() => {
                  setShowMenu((prev) => !prev)
                }}
                className="font-medium text-black rounded-lg bg-borderColor"
              >
                Huỷ
              </Button>
              <Button className="bg-borderColor text-black font-medium rounded-lg ml-2.5" onClick={handleUpdateBio}>
                Lưu
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-center">
            <span className="pt-1 text-lg font-normal text-center">{user?.bio}</span>
            <Button
              className="justify-center w-full mt-3 text-base tablet:text-lg font-semibold text-black rounded-lg bg-borderColor "
              onClick={handleAddBio}
            >
              {user?.bio ? 'Chỉnh sửa tiểu sử' : ' Thêm tiểu sử'}
            </Button>
          </div>
        </>
      )}

      <ul className="mt-1 tablet:mt-5">
        <li className="flex items-center px-4 mt-2">
          <FaUserAlt className="" fontSize={20} />
          <span className="ml-3 text-base tablet:text-lg font-normal">
            Giới tính: {user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Khác'}
          </span>
        </li>
        {user?.address && (
          <li className="flex items-center px-4 mt-2">
            <MdLocationOn className="" fontSize={20} />
            <span className="ml-3 text-base tablet:text-lg font-normal">Đến từ: {user?.address}</span>
          </li>
        )}

        <li className="flex items-center px-4 mt-2">
          <BsClockFill className="" fontSize={20} />
          <span className="ml-3 text-base tablet:text-lg font-normal">
            Tham gia từ tháng {date.getMonth() + 1} năm {date.getFullYear()}
          </span>
        </li>
        {hobbyUser.length > 0 && (
          <li className="flex mt-3.5 px-4 flex-wrap gap-3">
            {hobbyUser.map((item) => (
              <div key={item?.id} className="px-3 py-1.5 rounded-3xl border border-borderColor">
                {item?.content}
              </div>
            ))}
          </li>
        )}
      </ul>
      <div>
        <Button
          className="justify-center w-full mt-3 mb-3 tablet:mb-0 text-base tablet:text-lg font-semibold text-black rounded-lg bg-borderColor "
          onClick={handleAddHobbies}
        >
          {hobbyUser && hobbyUser.length > 0 ? 'Chỉnh sửa sở thích' : 'Thêm sở thích'}
        </Button>
      </div>

      <MyModal isOpen={isOpenModalAddHobbies} handleClose={handleCloseModalAddHobbies}>
        <div className="relative w-[700px]">
          <div className="">
            <Image src={bgHobby} className="w-full border-0 rounded-none" />
          </div>
          <div className="flex flex-col items-center pb-6 mt-3 mb-6 border-b border-borderColor">
            <h1 className="text-2xl font-medium">
              {hobbyUser && hobbyUser.length > 0 ? 'Chỉnh sửa sở thích' : 'Thêm sở thích'}
            </h1>
            <p className="text-lg">Bạn thích làm gì? Hãy chọn các sở thích phổ biến dưới đây nhé.</p>
          </div>
          <div className="mb-4">
            <span>Sở thích được đề xuất</span>
            <ul className="flex flex-wrap justify-center">
              {listHobbies &&
                listHobbies.length > 0 &&
                listHobbies.map((item) => (
                  <li
                    key={item?.id}
                    className={`px-3 py-1.5 m-1.5 rounded-3xl border ${listHobbyChoosen.includes(item?._id) ? 'border-primary' : 'border-borderColor'
                      }  cursor-pointer hover:bg-hoverColor`}
                    onClick={() => handleAddBobby(item?._id)}
                  >
                    {item?.content}
                  </li>
                ))}
            </ul>
          </div>
          <div className="flex items-center justify-between mt-7 pb-7">
            <div className="flex items-center">
              <span className="mr-3">
                <BsGlobeAmericas />
              </span>
              <p>Sở thích hiển thị công khai</p>
            </div>
            {listHobbyChoosen.length > 0 && (
              <div className="flex items-center ">
                <Button
                  className="text-black bg-borderColor rounded-xl"
                  onClick={() => {
                    setListHobbyChoosen([])
                    setIsOpenModalAddHobbies(false)
                  }}
                >
                  Huỷ
                </Button>
                <Button className="ml-3 bg-primary rounded-xl" onClick={handleSaveMyHobbies}>
                  Lưu
                </Button>
              </div>
            )}
          </div>
          <div
            className="absolute top-0 right-0 p-4 cursor-pointer hover:opacity-80"
            onClick={handleCloseModalAddHobbies}
          >
            <span>
              <AiOutlineClose size={24} />
            </span>
          </div>
        </div>
      </MyModal>
    </div>
  )
}

export default InfoMyProfile
