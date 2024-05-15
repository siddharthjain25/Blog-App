import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  passwordReset
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

export default function ForgotPassword() {
  const [formData1, setFormData1] = useState({});
  const [formData2, setFormData2] = useState({});
  const [formData3, setFormData3] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [isVerification, setIsVerfication] = useState(null);

  const handleChange1 = (e) => {
    setFormData1({ ...formData1, [e.target.id]: e.target.value.trim() });
  };

  const handleChange2 = (e) => {
    setFormData2({ ...formData2, [e.target.id]: e.target.value.trim() });
  };

  const handleChange3 = (e) => {
    setFormData3({ ...formData3, [e.target.id]: e.target.value.trim() });
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData1),
      });
      const data = await res.json();
      if (data.success === false) {
        setErrorMessage(data.message);
        setLoading(false);
      }

      if (res.ok) {
        setLoading(false);
        dispatch(passwordReset(data));
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  const handleVerification = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData2),
      });
      const data = await res.json();
      if (data.success === false) {
        setErrorMessage(data.message);
        setLoading(false);
      }

      if (res.ok) {
        setLoading(false);
        dispatch(passwordReset(data));
        setIsVerfication(true);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  }
  const handleReset = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const newData = {
        email: formData1.email,
        password: formData3.password
      };
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      });
      const data = await res.json();
      if (data.success === false) {
        setErrorMessage(data.message);
        setLoading(false);
      }

      if (res.ok) {
        setLoading(false);
        dispatch(passwordReset(data));
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <div className='min-h-screen mt-20'>
      <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>
        {/* left */}
        <div className='flex-1'>
          <Link to='/' className='font-bold dark:text-white text-4xl'>
            <span className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>
              Thousand Winters
            </span>
            Blog
          </Link>
          <p className='text-sm mt-5'>
          You can sign up with your email and password or with Google.
          </p>
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
              />
            </div>
              <div>
                <Label value='New Password' />
                <TextInput
                  type='password'
                  placeholder='Enter your new password'
                  id='password'
                  onChange={handleChange3}
                />
              </div>
              <Button
                gradientDuoTone='purpleToPink'
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
            <form className='flex flex-col gap-4' onSubmit={handleEmail}>
            <div>
              <Label value='Your email' />
              <TextInput
                type='email'
                placeholder='name@company.com'
                id='email'
                onChange={handleChange1}
              />
            </div>
            <Button
              gradientDuoTone='purpleToPink'
              type='submit'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size='sm' />
                  <span className='pl-3'>Loading...</span>
                </>
              ) : (
                'Get Verification Code'
              )}
            </Button>
            </form>
            <form className='flex flex-col gap-4' onSubmit={handleVerification}>
            <div>
              <Label value='Verification Code' />
              <TextInput
                placeholder='**********'
                id='otp'
                onChange={handleChange2}
              />
            </div>
            <Button
              gradientDuoTone='purpleToPink'
              type='submit'
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size='sm' />
                  <span className='pl-3'>Loading...</span>
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
            <OAuth />
          </form>
          </>}
          <div className='flex gap-2 text-sm mt-5'>
            <span>Dont Have an account?</span>
            <Link to='/sign-up' className='text-blue-500'>
              Sign Up
            </Link>
          </div>
          {errorMessage && (
            <Alert className='mt-5' color='green'>
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
