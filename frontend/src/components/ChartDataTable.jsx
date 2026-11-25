/**
 * Alternativa textual y consultable para las gráficas SVG.
 * Las celdas reciben los mismos datos que se pasan a Recharts, de modo que
 * la información no depende del color ni de pasar el cursor sobre la gráfica.
 */
export default function ChartDataTable({ title, columns, rows }) {
  return (
    <details className="chart-data">
      <summary>Consultar datos de la gráfica en tabla</summary>
      <div className="table-scroll chart-data-scroll" role="region" aria-label={title} tabIndex={0}>
        <table className="data-table">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={column} scope="col" className={index > 0 ? "num" : undefined}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) =>
                  cellIndex === 0 ? (
                    <th key={cellIndex} scope="row">{cell}</th>
                  ) : (
                    <td key={cellIndex} className="num">{cell}</td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
