import moment from 'moment';

export const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
export const getWeeksInRange = (start, end, startDay) => {
  const weeks = [],
    firstDate = new Date(start),
    lastDate = new Date(end),
    numDays = lastDate.getDate(),
    numDays2 = firstDate.getDate();

  let dayOfWeekCounter = firstDate.getDay();

  for (let date = numDays2; date <= numDays; date++) {
    if (dayOfWeekCounter === startDay || weeks.length === 0) {
      weeks.push([]);
    }
    weeks[weeks.length - 1].push(date);
    dayOfWeekCounter = (dayOfWeekCounter + 1) % 7;
  }

  return weeks
    .filter((w) => !!w.length)
    .map((w) => ({
      start: w[0],
      end: w[w.length - 1],
      dates: w,
    }));
}

export const getWeeksInRangeV2 = (start, end, startDay) => {
  const weeks = [],
    firstDate = moment(start),
    lastDate = moment(end);
    // numDays = lastDate.getDate(),
    // numDays2 = firstDate.getDate();

  let dayOfWeekCounter = firstDate.day();

  for (let date = firstDate; moment(date.startOf('day')).isSameOrBefore(lastDate.startOf('day')); date=date.add(1, 'days')) {
    if (dayOfWeekCounter === startDay || weeks.length === 0) {
      weeks.push([]);
    }
    weeks[weeks.length - 1].push(date.toDate());
    dayOfWeekCounter = (dayOfWeekCounter + 1) % 7;
  }

  return weeks
    .filter((w) => !!w.length)
    .map((w) => ({
      start: w[0],
      end: w[w.length - 1],
      dates: w,
    }));
}

export const getTimeFromSecondsHHMM = (seconds) => {
  const hoursFromSeconds = parseInt(seconds / 3600)
  const minutesFromSecond = moment.utc(parseInt((seconds - hoursFromSeconds * 3600)) * 1000).format('mm')
  const time = hoursFromSeconds + ':' + minutesFromSecond;
  return time
}

export const getSecondsFromTimeHHMM = (time) => {
  const timeArray = time.split(':');
  const secondsFromHours = Number(timeArray[0]) * 3600;
  const secondsFromMinutes = Number(timeArray[1]) * 60;
  const timeInSeconds = secondsFromHours + secondsFromMinutes;
  return timeInSeconds;
}

export const zeroPad = (num, size) => {
  var s = String(num);
  while (s.length < (size || 2)) { s = "0" + s; }
  return s;
}