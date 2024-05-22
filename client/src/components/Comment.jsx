import moment from 'moment';
import { useEffect, useState } from 'react';
import { FaThumbsUp } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { Button, Textarea, Modal } from 'flowbite-react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

export default function Comment({ comment, onLike, onEdit, onDelete, replyToUserId }) {
  const [user, setUser] = useState({});
  const [replyToUser, setReplyToUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const { currentUser } = useSelector((state) => state.user);
  const [replyForm, setReplyForm] = useState(false);
  const [reply, setReply] = useState('');
  const [replies, setReplies] = useState([]);
  const [commentError, setCommentError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [replyIdToDelete, setReplyIdToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/user/${comment.userId}`);
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          console.error('Failed to fetch user:', data.message);
        }
      } catch (error) {
        console.error('Error fetching user:', error.message);
      }
    };

    const getReplyToUser = async () => {
      if (replyToUserId) {
        try {
          const res = await fetch(`/api/user/${replyToUserId}`);
          const data = await res.json();
          if (res.ok) {
            setReplyToUser(data);
          } else {
            console.error('Failed to fetch replyTo user:', data.message);
          }
        } catch (error) {
          console.error('Error fetching replyTo user:', error.message);
        }
      }
    };

    const getReplies = async () => {
      try {
        const res = await fetch(`/api/comment/replies/${comment._id}`);
        const data = await res.json();
        if (res.ok) {
          setReplies(data);
        } else {
          console.error('Failed to fetch replies:', data.message);
        }
      } catch (error) {
        console.error('Error fetching replies:', error.message);
      }
    };

    getUser();
    getReplyToUser();
    getReplies();
  }, [comment, replyToUserId]);

  const handleReplyButton = () => {
    setReplyForm(true);
  };

  const closeReplyForm = () => {
    setReplyForm(false);
  };

  const handleLike = async (commentId) => {
    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }
      
      const res = await fetch(`/api/comment/likeComment/${commentId}`, {
        method: 'PUT',
      });
      
      if (res.ok) {
        const { likes, numberOfLikes } = await res.json();
        setReplies((prevComments) =>
          prevComments.map((comment) => {
            if (comment._id === commentId) {
              return {
                ...comment,
                likes: likes,
                numberOfLikes: numberOfLikes,
              };
            }
            return comment;
          })
        );
      } else {
        console.error('Failed to like/unlike comment:', await res.json());
      }
    } catch (error) {
      console.error('Error liking/unliking comment:', error.message);
    }
  };
  
  
  const handleReply = async (e) => {
    e.preventDefault();
    if (reply.length > 200) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/comment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: reply,
          postId: comment.postId,
          userId: currentUser._id,
          isAreply: true,
          replyTo: comment._id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReply('');
        setReplies([data, ...replies]);
        setReplyForm(false);
      } else {
        setCommentError(data.message);
      }
    } catch (error) {
      setCommentError('Error submitting reply: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comment/editComment/${comment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editedContent,
        }),
      });
      if (res.ok) {
        setIsEditing(false);
        comment.content = editedContent;
      } else {
        console.error('Failed to save comment:', await res.json());
      }
    } catch (error) {
      console.error('Error saving comment:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReply = async () => {
    setLoading(true);
    setShowModal(false);
    try {
      const res = await fetch(`/api/comment/deleteComment/${replyIdToDelete}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setReplies(replies.filter(reply => reply._id !== replyIdToDelete));
        setReplyIdToDelete(null);
      } else {
        console.error('Failed to delete reply:', await res.json());
      }
    } catch (error) {
      console.error('Error deleting reply:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteReply = (replyId) => {
    setReplyIdToDelete(replyId);
    setShowModal(true);
  };

  return (
    <div className='flex flex-col p-4 border-b dark:border-gray-600 text-sm pl-0 max-w-full'>
      <div className='flex items-start'>
        <div className='flex-shrink-0 mr-3'>
          <img
            className='w-10 h-10 rounded-full bg-gray-200'
            src={user.profilePicture}
            alt={user.username}
          />
        </div>
        <div className='flex-1'>
          <div className='flex items-center mb-1'>
            <span className='font-bold mr-1 text-xs truncate'>
              {user ? `@${user.username}` : 'anonymous user'}
            </span>
            <span className='text-gray-500 text-xs'>
              {moment(comment.createdAt).fromNow()}
            </span>
          </div>
          {replyToUser && (
            <p className='text-xs text-gray-400 mb-2'>
              Replied to @{replyToUser.username}
            </p>
          )}
          {isEditing ? (
            <>
              <Textarea
                className='mb-2'
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
              <div className='flex justify-end gap-2 text-xs'>
                <Button
                  type='button'
                  size='sm'
                  className="text-white font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 rounded-lg"
                  onClick={handleSave}
                  disabled={loading}
                >
                  Save
                </Button>
                <Button
                  type='button'
                  size='sm'
                  className="text-white font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 rounded-lg"
                  outline
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className='text-gray-500 pb-2'>{comment.content}</p>
              <div className='flex items-center pt-2 text-xs border-t dark:border-gray-700 max-w-fit gap-2'>
                <button
                  type='button'
                  onClick={() => onLike(comment._id)}
                  className={`text-gray-400 hover:text-blue-500 ${
                    currentUser &&
                    comment.likes.includes(currentUser._id) &&
                    '!text-blue-500'
                  }`}
                >
                  <FaThumbsUp className='text-sm' />
                </button>
                <p className='text-gray-400'>
                  {comment.numberOfLikes > 0 &&
                    comment.numberOfLikes +
                      ' ' +
                      (comment.numberOfLikes === 1 ? 'like' : 'likes')}
                </p>
                <button
                  type='button'
                  onClick={handleReplyButton}
                  className='text-gray-400 hover:text-blue-500'
                >
                  Reply
                </button>
                
                {currentUser &&
                  (currentUser._id === comment.userId || currentUser.isAdmin) && (
                    <>
                      <button
                        type='button'
                        onClick={handleEdit}
                        className='text-gray-400 hover:text-blue-500'
                      >
                        Edit
                      </button>
                      <button
                        type='button'
                        onClick={() => onDelete(comment._id)}
                        className='text-gray-400 hover:text-red-500'
                      >
                        Delete
                      </button>
                    </>
                  )}
              </div>
            </>
          )}
          {currentUser && replyForm && (
            <div className='flex items-center gap-1 my-5 text-gray-500 text-sm'>
              <form
                    onSubmit={handleReply}
                    className='border border-teal-500 rounded-md p-3 w-full'
                  >
                    <Textarea
                      placeholder='Add a reply...'
                      rows='3'
                      maxLength='200'
                      onChange={(e) => setReply(e.target.value)}
                      value={reply}
                      disabled={loading}
                    />
                    <div className='flex justify-between items-center mt-5'>
                      <p className='text-gray-500 text-xs'>
                        {200 - reply.length} characters remaining
                      </p>
                      <div className='flex space-x-3 items-center'>
                        <Button outline className="text-white font-extrabold bg-gradient-to-r from-red-500 to-red-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 rounded-lg" onClick={closeReplyForm} disabled={loading}>
                        Cancel
                      </Button>
                      <Button outline className="text-white font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 rounded-lg" type='submit' disabled={loading}>
                        Submit
                      </Button>
                      </div>
                    </div>
                    {commentError && (
                      <p className='text-red-500 mt-2'>{commentError}</p>
                    )}
                  </form>
            </div>
          )}
        </div>
      </div>
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
              Are you sure you want to delete this comment?
            </h3>
            <div className='flex justify-center gap-4'>
              <Button
                color='failure'
                onClick={handleDeleteReply}
                disabled={loading}
              >
                Yes, I'm sure
              </Button>
              <Button color='gray' onClick={() => setShowModal(false)} disabled={loading}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <div className='pl-2'>
        {replies.map((reply) => (
          <Comment
            key={reply._id}
            comment={reply}
            onLike={handleLike}
            onEdit={onEdit}
            onDelete={() => confirmDeleteReply(reply._id)}
            replyToUserId={comment.userId} // Pass the userId of the original comment
          />
        ))}
      </div>
    </div>
  );
}
