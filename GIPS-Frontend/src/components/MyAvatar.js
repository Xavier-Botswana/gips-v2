// hooks
import { useSelector } from 'react-redux';
import createAvatar from '../utils/createAvatar';
import Avatar from './Avatar';

// ----------------------------------------------------------------------

export default function MyAvatar({ ...other }) {
  const { record } = useSelector((state) => state.user);

  const displayName = record?.displayName || record?.name || '';
  const avatarData = createAvatar(displayName);

  return (
    <Avatar
      src={record?.photoURL || record?.avatar}
      alt={displayName}
      color={record?.photoURL ? 'default' : avatarData.color}
      {...other}
    >
      {avatarData.name}
    </Avatar>
  );
}
