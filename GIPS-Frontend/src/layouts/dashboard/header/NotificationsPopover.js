import React, { useState, useEffect, useCallback } from 'react';
import { Box, Badge, Typography, List, ListItemButton, ListItemText, Divider, CircularProgress } from '@mui/material';
import { noCase } from 'change-case';
import MenuPopover from '../../../components/MenuPopover';
import Iconify from '../../../components/Iconify';
import Scrollbar from '../../../components/Scrollbar';
import { IconButtonAnimate } from '../../../components/animate';
import { fToNow } from '../../../utils/formatTime';
import axios from '../../../utils/axios';

const isValidNotification = (notification) => {
  const isValidAudience = notification.audience === 'All' || notification.audience === 'All Staff';
  const isValidChannel =
    notification.communicationChannel === 'In-System' || notification.communicationChannel === 'Once-off';
  return isValidAudience && isValidChannel;
};

const NotificationsPopover = () => {
  const [notifications, setNotifications] = useState([]);
  const [dismissedNotifications, setDismissedNotifications] = useState(() => {
    const saved = localStorage.getItem('dismissedNotifications');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchNotificationsPage = async (page) => {
    try {
      const response = await axios.get(`/v1/notifications?page=${page}`);

      const newNotifications = response.data.notifications.filter(isValidNotification);

      return {
        items: newNotifications,
        totalPages: response.data.totalPages,
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { items: [], totalPages: 1 };
    }
  };

  const loadAllNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const firstPage = await fetchNotificationsPage(1);
      const allNotifications = [...firstPage.items];

      if (firstPage.totalPages > 1) {
        const pagePromises = [];
        for (let page = 2; page <= firstPage.totalPages; page += 1) {
          pagePromises.push(fetchNotificationsPage(page));
        }

        const additionalPages = await Promise.all(pagePromises);
        additionalPages.forEach((pageResult) => {
          allNotifications.push(...pageResult.items);
        });
      }

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error loading all notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllNotifications();
  }, [loadAllNotifications]);

  const activeNotifications = notifications.filter((notification) => !dismissedNotifications.has(notification.id));

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleDismiss = (notification) => {
    setDismissedNotifications((prev) => {
      const newSet = new Set(prev);
      newSet.add(notification.id);

      localStorage.setItem('dismissedNotifications', JSON.stringify([...newSet]));
      return newSet;
    });
  };

  const renderNotificationContent = (notification) => {
    const title = (
      <Typography variant="subtitle2">
        {notification.communicationTopic}
        <Typography component="span" variant="body2" sx={{ color: 'text.secondary' }}>
          &nbsp; {noCase(notification.messageDescription)}
        </Typography>
      </Typography>
    );

    return { title };
  };

  return (
    <>
      <IconButtonAnimate color={open ? 'primary' : 'default'} onClick={handleOpen} sx={{ width: 40, height: 40 }}>
        <Badge badgeContent={activeNotifications.length} color="error">
          <Iconify icon="eva:bell-fill" width={20} height={20} />
        </Badge>
      </IconButtonAnimate>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{ width: 360, p: 0, mt: 1.5, ml: 0.75 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
          </Box>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ height: { xs: 340, sm: 'auto' } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List disablePadding>
              {activeNotifications.length === 0 ? (
                <ListItemButton sx={{ py: 1.5, px: 2.5 }}>
                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No new notifications
                      </Typography>
                    }
                  />
                </ListItemButton>
              ) : (
                activeNotifications.map((notification) => (
                  <ListItemButton
                    key={notification.id}
                    sx={{
                      py: 1.5,
                      px: 2.5,
                      mt: '1px',
                    }}
                    onClick={() => handleDismiss(notification)}
                  >
                    <ListItemText
                      primary={renderNotificationContent(notification).title}
                      secondary={
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.5,
                            display: 'flex',
                            alignItems: 'center',
                            color: 'text.disabled',
                          }}
                        >
                          <Iconify icon="eva:clock-outline" sx={{ mr: 0.5, width: 16, height: 16 }} />
                          {fToNow(notification.created)}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                ))
              )}
            </List>
          )}
        </Scrollbar>
      </MenuPopover>
    </>
  );
};

export default NotificationsPopover;
