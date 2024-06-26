import { Alert, Button, Modal, TextInput } from 'flowbite-react';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutSuccess,
} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import LoadingBar from 'react-top-loading-bar';

export default function DashProfile() {
  const { currentUser, error, loading } = useSelector((state) => state.user);
  const [imageFile, setImageFile] = useState(null);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const [imageFileUploadProgress, setImageFileUploadProgress] = useState(null);
  const [imageFileUploadError, setImageFileUploadError] = useState(null);
  const [imageFileUploading, setImageFileUploading] = useState(false);
  const [updateUserSuccess, setUpdateUserSuccess] = useState(null);
  const [updateUserError, setUpdateUserError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const filePickerRef = useRef();
  const [progress, setProgress] = useState(0);

  const dispatch = useDispatch();
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageFileUrl(URL.createObjectURL(file));
    }
  };
  useEffect(() => {
    setProgress(10);
    if (imageFile) {
      uploadImage();
      setProgress(100);
    }
    setProgress(100);
  }, [imageFile]);

  const uploadImage = async () => {
    // service firebase.storage {
    //   match /b/{bucket}/o {
    //     match /{allPaths=**} {
    //       allow read;
    //       allow write: if
    //       request.resource.size < 2 * 1024 * 1024 &&
    //       request.resource.contentType.matches('image/.*')
    //     }
    //   }
    // }
    setImageFileUploading(true);
    setImageFileUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + imageFile.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        setImageFileUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageFileUploadError(
          'Could not upload image (File must be less than 2MB)'
        );
        setImageFileUploadProgress(null);
        setImageFile(null);
        setImageFileUrl(null);
        setImageFileUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageFileUrl(downloadURL);
          setFormData({ ...formData, profilePicture: downloadURL });
          setImageFileUploading(false);
        });
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateUserError(null);
    setUpdateUserSuccess(null);
    setProgress(10);
    if (Object.keys(formData).length === 0) {
      setUpdateUserSuccess('No changes made');
      setProgress(100);
      setTimeout(() => {
        setUpdateUserSuccess(null);
      }, 2500);
      return;
    }
    if (imageFileUploading) {
      setUpdateUserError('Please wait for image to upload');
      setTimeout(() => {
        setUpdateUserError(null);
      }, 2500);
      return;
    }
    try {
      dispatch(updateStart());
      setProgress(10);
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      setProgress(30);
      const data = await res.json();
      if (!res.ok) {
        dispatch(updateFailure(data.message));
        setUpdateUserError(data.message);
        setProgress(100);
        setTimeout(() => {
          setUpdateUserError(null);
        }, 2500);
      } else {
        dispatch(updateSuccess(data));
        setProgress(100);
        setUpdateUserSuccess("User's profile updated successfully");
        setTimeout(() => {
          setUpdateUserSuccess(null);
        }, 2500);
      }
    } catch (error) {
      dispatch(updateFailure(error.message));
      setUpdateUserError(error.message);
      setProgress(100);
      setTimeout(() => {
        setUpdateUserError(null);
      }, 2500);
    }
  };
  const handleDeleteUser = async () => {
    setShowModal(false);
    try {
      dispatch(deleteUserStart());
      setProgress(10);
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      setProgress(40);
      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
        setProgress(100);
        setTimeout(() => {
          deleteUserFailure(null);
        }, 2500);
      } else {
        dispatch(deleteUserSuccess(data));
        setProgress(100);
      }
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
      setProgress(100);
      setTimeout(() => {
        deleteUserFailure(null);
      }, 2500);
    }
  };

  const handleSignout = async () => {
    try {
      setProgress(10);
      const res = await fetch('/api/user/signout', {
        method: 'POST',
      });
      setProgress(50);
      const data = await res.json();
      if (!res.ok) {
        setUpdateUserError(data.message);
        setProgress(100);
        setTimeout(() => {
          setUpdateUserError(null);
        }, 2500);
      } else {
        setProgress(100);
        dispatch(signoutSuccess()); 
      }
    } catch (error) {
      setUpdateUserError(error.message);
      setProgress(100);
      setTimeout(() => {
        setUpdateUserError(null);
      }, 2500);
    }
  };

  const [copied, setCopied] = useState(false);

const copyRecoveryCode = async () => {
  try {
    await navigator.clipboard.writeText(currentUser.recoveryCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  } catch (error) {
    setUpdateUserError('Error copying recovery code');
    setTimeout(() => {
      setUpdateUserError(null);
    }, 2500);
  }
};

  return (
    <div className='max-w-lg mx-auto p-3 w-full'>
      <LoadingBar
        color='cyan'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <h1 className='my-7 text-center font-semibold text-3xl'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='file'
          accept='image/*'
          onChange={handleImageChange}
          ref={filePickerRef}
          hidden
        />
        <div
          className='relative w-32 h-32 self-center cursor-pointer shadow-md overflow-hidden rounded-full'
          onClick={() => filePickerRef.current.click()}
        >
          {imageFileUploadProgress && (
            <CircularProgressbar
              value={imageFileUploadProgress || 0}
              text={`${imageFileUploadProgress}%`}
              strokeWidth={5}
              styles={{
                root: {
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                },
                path: {
                  stroke: `rgba(62, 152, 199, ${
                    imageFileUploadProgress / 100
                  })`,
                },
              }}
            />
          )}
          <img
            src={imageFileUrl || currentUser.profilePicture}
            alt='user'
            className={`rounded-full w-full h-full object-cover border-8 border-[lightgray] ${
              imageFileUploadProgress &&
              imageFileUploadProgress < 100 &&
              'opacity-60'
            }`}
          />
        </div>
        {imageFileUploadError && (
          <Alert color='failure'>{imageFileUploadError}</Alert>
        )}
        <TextInput
          type='text'
          id='username'
          placeholder='username'
          defaultValue={currentUser.username}
          onChange={handleChange}
        />
        <TextInput
          type='email'
          id='email'
          placeholder='email'
          defaultValue={currentUser.email}
          onChange={handleChange}
        />
        <TextInput
          type='password'
          id='password'
          placeholder='password'
          onChange={handleChange}
        />
        <Button
          type='submit'
          //gradientDuoTone='purpleToBlue'
          className="text-white font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 rounded-lg"
          outline
          disabled={loading || imageFileUploading}
        >
          {loading ? 'Loading...' : 'Update'}
        </Button>
        {updateUserSuccess && (
        <Alert color='success' className='mt-5'>
          {updateUserSuccess}
        </Alert>
        )}
        {updateUserError && (
        <Alert color='failure' className='mt-5'>
          {updateUserError}
        </Alert>
        )}
        {currentUser.isAdmin && (
          <Link to={'/create-post'}>
            <Button
              type='button'
              className="text-white w-full font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 rounded-lg"
            >
              Create a post
            </Button>
          </Link>
        )}
      </form>
      <div className="text-white-500 mt-14 font-extrabold text-xl">Recovery code</div>
        <div className="text-red-500 mt-2">You can use this code to access your account if you lose access to your sign-in info. Store it in a safe place.</div>
        <div className='flex flex-col gap-4'>
          <Button className='mt-2' onClick={copyRecoveryCode} color='gray' outline>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2zM8 12h-2v4h2zM16 16h-2a2 2 0 01-2-2V6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2zM16 12h-2v4h2z" />
            </svg>
            Copy Recovery Code
          </Button>
        </div>
        {copied && (
          <div className="text-green-500 mt-2">Recovery code copied!</div>
        )}
        <div className='text-red-500 flex justify-between mt-5'>
        <span onClick={() => setShowModal(true)} className='cursor-pointer'>
          Delete Account
        </span>
        <span onClick={handleSignout} className='cursor-pointer'>
          Sign Out
        </span>
      </div>
      {/* {error && (
        <Alert color='failure' className='mt-5'>
          {error}
        </Alert>
      )} */}
      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size='md'
      >
        <Modal.Header />
        <Modal.Body>
          <div className='text-center'>
            <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
            <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
              Are you sure you want to delete your account?
            </h3>
            <div className='flex justify-center gap-4'>
              <Button color='failure' onClick={handleDeleteUser}>
                Yes, I'm sure
              </Button>
              <Button color='gray' onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
