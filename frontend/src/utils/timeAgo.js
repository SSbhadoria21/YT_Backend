export const timeAgo = (date) => {
  if (!date) return "";
  
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = seconds / 31536000;
  if (interval >= 1) {
    const val = Math.floor(interval);
    return val === 1 ? "1 year ago" : `${val} years ago`;
  }
  
  interval = seconds / 2592000;
  if (interval >= 1) {
    const val = Math.floor(interval);
    return val === 1 ? "1 month ago" : `${val} months ago`;
  }
  
  interval = seconds / 86400;
  if (interval >= 1) {
    const val = Math.floor(interval);
    return val === 1 ? "1 day ago" : `${val} days ago`;
  }
  
  interval = seconds / 3600;
  if (interval >= 1) {
    const val = Math.floor(interval);
    return val === 1 ? "1 hour ago" : `${val} hours ago`;
  }
  
  interval = seconds / 60;
  if (interval >= 1) {
    const val = Math.floor(interval);
    return val === 1 ? "1 minute ago" : `${val} minutes ago`;
  }
  
  return "just now";
};
