import { format, getDayOfYear, getDaysInYear, setDefaultOptions } from "date-fns";
import { nb } from 'date-fns/locale';
import { groupBy } from 'lodash';
import './jakttider.css';
import { jakttider } from './vilt';

type Hovedkategori = 'storvilt' | 'småvilt'

interface Vilt {
  kategori?: string;
  name: string;
  start: Date;
  end: Date;
}

interface JaktIntervall {
  start: Date;
  end: Date;
}

setDefaultOptions({ locale: nb })

const getPercentage = (day: number, daysInYear: number) => {
  return day * 100 / daysInYear;
}

const getIntervalElement = (tid: JaktIntervall) => {
  const thisYearsDays = getDaysInYear(new Date());
  const getPercentageThisYear = (days: number) => getPercentage(days, thisYearsDays);

  const startDayOfYear = getDayOfYear(tid.start);
  const endDayOfYear = getDayOfYear(tid.end);

  const left = getPercentageThisYear(startDayOfYear - 1) + '%';
  const width = getPercentageThisYear(endDayOfYear - startDayOfYear + 1) + '%';

  return <div className='interval'
    style={{ width, left }}>
  </div>
}

const getBodies = (hovedkategori: Hovedkategori) => {
  const vilt = jakttider
    .filter(tid => hovedkategori === "storvilt" ? tid.storvilt : !tid.storvilt)

  const groups = groupBy(vilt, 'kategori');

  return Object.keys(groups).map(key => {
    const tider = groups[key];

    const rows = getRows(tider);
    return <tbody>
      <tr><td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold' }}>{key}</td></tr>
      {rows}
    </tbody>
  })
}

const getRows = (vilter: Vilt[]) => {
  const year = new Date().getFullYear();

  return vilter.map(vilt => {
    const tider: JaktIntervall[] = [];
    if (vilt.start.getTime() > vilt.end.getTime()) {
      tider.push({ start: vilt.start, end: new Date(`${year}-12-23`) });
      tider.push({ start: new Date(`${year + 1}-01-01`), end: vilt.end });
    } else {
      tider.push({ start: vilt.start, end: vilt.end });
    }

    const intervals = tider.map((tid) => {
      return getIntervalElement(tid);
    });

    const dateFormat = 'do LLL';
    const from = format(vilt.start, dateFormat);
    const to = format(vilt.end, dateFormat);
    const title = `${from} - ${to}`;

    return <tr>
      <td style={{ whiteSpace: 'nowrap' }}>{vilt.name}</td>
      <td style={{ width: '100%' }}>
        <div className='year' title={title}>
          {intervals}
        </div>
      </td>
    </tr>
  });
}

export function JaktTider() {
  const storVilt = getBodies('storvilt');
  const småVilt = getBodies('småvilt');

  return (
    <div className="container">
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <td colSpan={2} style={{ textAlign: 'center' }}>
              <h1>Storvilt</h1>
            </td>
          </tr>
        </thead>

        {storVilt}
      </table>

      <table style={{ width: '100%' }}>
      <thead>
          <tr>
            <td colSpan={2} style={{ textAlign: 'center' }}>
              <h1>Småvilt</h1>
            </td>
          </tr>
        </thead>

        {småVilt}
      </table>
    </div >
  )
}