import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  passwordReset
} from '../redux/user/userSlice';
import LoadingBar from 'react-top-loading-bar';
import logo from './new-xspark-logo.png';

export default function ForgotPassword() {
  const [formData1, setFormData1] = useState({});
  const [formData2, setFormData2] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [isVerification, setIsVerfication] = useState(null);
  const navigate = useNavigate();
  const [progress, setProgress] = useState(100);
  const handleChange1 = (e) => {
    setFormData1({ ...formData1, [e.target.id]: e.target.value.trim() });
  };

  const handleChange2 = (e) => {
    setFormData2({ ...formData2, [e.target.id]: e.target.value.trim() });
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setProgress(10);
      const res = await fetch('/api/user/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData1),
      });
      setProgress(40);
      const data = await res.json();
      if (data.success === false) {
        setErrorMessage(data.message);
        setProgress(100);
        setTimeout(() => {
          setErrorMessage(null);
        }, 2500);
        setLoading(false);
      }

      if (res.ok) {
        setLoading(false);
        setSuccessMessage(data.message);
        setProgress(100);
        dispatch(passwordReset(data));
        setTimeout(() => {
          setSuccessMessage(null);
        }, 2500);
        setIsVerfication(true);
      }
    } catch (error) {
      setErrorMessage(error.message);
      setProgress(100);
      setTimeout(() => {
        setErrorMessage(null);
      }, 2500);
    }
  }
  const handleReset = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setProgress(10);
      const newData = {
        email: formData1.email,
        password: formData2.password
      };
      setProgress(20);
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      setProgress(60);
      const data = await res.json();
      if (data.success === false) {
        setErrorMessage(data.message);
        setProgress(100);
        setLoading(false);
      }

      if (res.ok) {
        setLoading(false);
        setProgress(100);
        setTimeout(() => {
          navigate("/sign-in");
        }, 2500);
        setSuccessMessage(data.message);
      }
    } catch (error) {
      setProgress(100);
      setErrorMessage(error.message);
    }
  }

  return (
    <div className='min-h-screen mt-20'>
      <LoadingBar
        color='cyan'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>
        {/* left */}
        <div className='flex-1'>
          <Link to='/' className='font-bold dark:text-white text-4xl'>
          <img src={logo} style={{height: '80px'}}></img>
          </Link>
        </div>
        {/* right */}

        <div className='flex-1'>
          {isVerification == true ? // Render reset form only on verification success
            <form className='flex flex-col gap-4' onSubmit={handleReset}>
            <div>
              <Label value='Your email' />
              <TextInput
                type='email'
                placeholder='name@company.com'
                id='email'
                value={formData1.email}
                disabled
              />
            </div>
              <div>
                <Label value='New Password' />
                <TextInput
                  type='password'
                  placeholder='Enter your new password'
                  id='password'
                  onChange={handleChange2}
                />
              </div>
              <Button
                //gradientDuoTone='purpleToPink'
                className="text-white font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 rounded-lg"
                type='submit'
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size='sm' />
                    <span className='pl-3'>Loading...</span>
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>
          : <>
            <form className='flex flex-col gap-4' onSubmit={handleVerification}>
            <div>
              <Label value='Your email' />
              <TextInput
                type='email'
                placeholder='name@company.com'
                id='email'
                onChange={handleChange1}
              />
            </div>
            <div>
              <Label value='Recovery Code' />
              <TextInput
                placeholder='**********'
                id='recoveryCode'
                onChange={handleChange1}
              />
            </div>
            <Button
              //gradientDuoTone='purpleToPink'
              className="text-white font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 rounded-lg"
              type='submit'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size='sm' />
                  <span className='pl-3'>Loading...</span>
                </>
              ) : (
                'Verify Recovery Code'
              )}
            </Button>
          </form>
          </>}
          {successMessage && (
            <Alert className='mt-5' color='success'>
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert className='mt-5' color='failure'>
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
