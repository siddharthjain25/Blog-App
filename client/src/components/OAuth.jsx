import { Button } from 'flowbite-react';
import { AiFillGoogleCircle } from 'react-icons/ai';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, getAuth } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LoadingBar from 'react-top-loading-bar'

export default function OAuth() {
    const auth = getAuth(app);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const resultsFromGoogle = await getRedirectResult(auth);
                if (resultsFromGoogle) {
                    const res = await fetch('/api/auth/google', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: resultsFromGoogle.user.displayName,
                            email: resultsFromGoogle.user.email,
                            googlePhotoUrl: resultsFromGoogle.user.photoURL,
                        }),
                    });
                    const data = await res.json();
                    if (res.ok) {
                        setProgress(40);
                        dispatch(signInSuccess(data));
                        setProgress(60);
                        navigate('/');
                        setProgress(100);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        };

        handleRedirectResult();
    }, [auth, dispatch, navigate]);

    const handleGoogleClick = () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        signInWithRedirect(auth, provider);
    };

    return (
        <>
            <LoadingBar
        color='cyan'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      /><Button
            type='button'
            className="text-white font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 rounded-lg"
            outline
            onClick={handleGoogleClick}
        >
            <AiFillGoogleCircle className='w-6 h-6 mr-2'/>
            Continue with Google
        </Button>
        </>
        
    );
}
