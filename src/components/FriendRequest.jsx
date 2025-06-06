import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { fireApi } from "../utils/useFire";

const FriendRequest = ({ request, getConnetionRequests, getSugestion }) => {

	const acceptConnectionRequest = async (requestId) => {
		try {
			const response = await fireApi(`/connections/accept/${requestId}`, 'PUT');
			toast.success(response.message || 'Connection request accepted successfully');
			getConnetionRequests();
			getSugestion();
		} catch (error) {
			console.error('Error in acceptConnectionRequest:', error);
			toast.error(error.message || 'Something went wrong!');
		}
	};

	const rejectConnectionRequest = async (requestId) => {
		try {
			const response = await fireApi(`/connections/reject/${requestId}`, 'PUT');
			toast.success(response.message || 'Connection request rejected successfully');
			getConnetionRequests();
			getSugestion();
		} catch (error) {
			console.error('Error in rejectConnectionRequest:', error);
			toast.error(error.message || 'Something went wrong!');
			
		}
	};

	return (
		<div className='bg-white rounded-lg shadow p-4 flex items-center justify-between transition-all hover:shadow-md'>
			<div className='flex items-center gap-4'>
				<Link to={`/profile/${request.sender.username}`}>
					<img
						src={request.sender.profilePicture || "/avatar.png"}
						alt={request.name}
						className='w-16 h-16 rounded-full object-cover'
					/>
				</Link>

				<div>
					<Link to={`/profile/${request.sender.username}`} className='font-semibold text-lg'>
						{request.sender.name}
					</Link>
					<p className='text-gray-600'>{request.sender.headline}</p>
				</div>
			</div>

			<div className='space-x-2'>
				<button
					className='bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors'
					onClick={() => acceptConnectionRequest(request._id)}
				>
					Accept
				</button>
				<button
					className='bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors'
					onClick={() => rejectConnectionRequest(request._id)}
				>
					Reject
				</button>
			</div>
		</div>
	);
};
export default FriendRequest;
