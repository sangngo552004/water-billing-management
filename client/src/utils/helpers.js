export const truncateContent = (content, maxLength) => {
    if (content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength) + "...";
  };