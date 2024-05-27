import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import LoadingBar from 'react-top-loading-bar'

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      setProgress(progress + 20);
      const res = await fetch('/api/post/getPosts');
      const data = await res.json();
      setProgress(progress + 60);
      setPosts(data.posts);
      setProgress(progress + 100);
    };
    fetchPosts();
  }, []);
  return (
    <div>
      <LoadingBar
        color='cyan'
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <div className='max-w-8xl mx-auto p-3 flex flex-col gap-8 py-7'>
        {posts && posts.length > 0 && (
          <div className='flex flex-col gap-6'>
            <h2 className='text-2xl font-semibold text-center'>Recent Posts</h2>
            <div className='flex flex-wrap justify-center gap-3'>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            <Link
              to={'/search'}
              className='text-lg text-teal-500 hover:underline text-center'
            >
              View all posts
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
