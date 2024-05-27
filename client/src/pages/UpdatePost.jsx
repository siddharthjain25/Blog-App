import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import { Editor } from '@tinymce/tinymce-react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useEffect, useRef, useState } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingBar from 'react-top-loading-bar';

export default function UpdatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({});
  const [publishError, setPublishError] = useState(null);
  const { postId } = useParams();
  const editorRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setProgress(10);
        const res = await fetch(`/api/post/getposts?postId=${postId}`);
        setProgress(40);
        const data = await res.json();
        if (!res.ok) {
          setProgress(100);
          setPublishError(data.message);
          return;
        }
        setPublishError(null);
        setFormData(data.posts[0]);
        setProgress(100);
      } catch (error) {
        setProgress(100);
        console.log(error.message);
      }
    };

    fetchPost();
  }, [postId]);

  const handleUpdloadImage = async () => {
    if (!file) {
      setImageUploadError('Please select an image');
      return;
    }
    setImageUploadError(null);
    const storage = getStorage(app);
    const fileName = new Date().getTime() + '-' + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageUploadError('Image upload failed');
        setImageUploadProgress(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUploadProgress(null);
          setImageUploadError(null);
          setFormData({ ...formData, image: downloadURL });
        });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setProgress(10);
      const res = await fetch(`/api/post/updatepost/${postId}/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      setProgress(40);
      const data = await res.json();
      if (!res.ok) {
        setProgress(100);
        setPublishError(data.message);
        return;
      }
      setPublishError(null);
      setProgress(100);
      navigate(`/post/${data.slug}`);
    } catch (error) {
      setProgress(100);
      setPublishError('Something went wrong');
    }
  };

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <LoadingBar
        color='cyan'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <h1 className='text-center text-3xl my-7 font-semibold'>Update post</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <div className='flex flex-col gap-4 sm:flex-row justify-between'>
          <TextInput
            type='text'
            placeholder='Title'
            required
            id='title'
            className='flex-1'
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            value={formData.title || ''}
          />
          <TextInput
            type='text'
            placeholder='Category'
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          />
        </div>
        <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3'>
          <FileInput
            type='file'
            accept='image/*'
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button
            type='button'
            className="text-white font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 rounded-lg"
            size='sm'
            outline
            onClick={handleUpdloadImage}
            disabled={imageUploadProgress}
          >
            {imageUploadProgress ? (
              <div className='w-16 h-16'>
                <CircularProgressbar
                  value={imageUploadProgress}
                  text={`${imageUploadProgress || 0}%`}
                />
              </div>
            ) : (
              'Upload Image'
            )}
          </Button>
        </div>
        {imageUploadError && <Alert color='failure'>{imageUploadError}</Alert>}
        {formData.image && (
          <img
            src={formData.image}
            alt='upload'
            className='w-full h-72 object-cover'
          />
        )}
        <Editor
          apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
          onInit={(evt, editor) => (editorRef.current = editor)}
          initialValue={formData.content || ''}
          init={{
            height: 800,
            skin: "oxide-dark",
            content_css: "dark",
            plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed linkchecker a11ychecker tinymcespellchecker permanentpen powerpaste advtable advcode editimage advtemplate mentions tableofcontents footnotes autocorrect typography inlinecss markdown',
            toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
          }}
          onBlur={() => {
            setFormData({ ...formData, content: editorRef.current.getContent() });
          }}
        />
        <Button type='submit' className="text-white font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 rounded-lg">
          Update post
        </Button>
        {publishError && (
          <Alert className='mt-5' color='failure'>
            {publishError}
          </Alert>
        )}
      </form>
    </div>
  );
}
