import { formatDistanceToNow, format, differenceInHours } from "date-fns";
import { id } from "date-fns/locale";

export const formatPostDate = (dateString: string): string => {
  const date = new Date(dateString);
  const hoursDiff = differenceInHours(new Date(), date);
  
  if (hoursDiff < 1) {
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: id,
    });
  } else {
    return format(date, "EEEE, dd/MM/yy HH:mm", { locale: id });
  }
};