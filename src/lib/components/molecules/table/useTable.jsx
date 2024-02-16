import { useMemo } from 'preact/hooks'

const sortAscending = (accessor) => {
  return (a, b) => {
    const valueA = a[accessor]
    const valueB = b[accessor]
    if (valueA < valueB) return -1
    if (valueA > valueB) return 1
    return 0
  }
}

const sortDescending = (accessor) => {
  return (a, b) => {
    const valueA = a[accessor]
    const valueB = b[accessor]
    if (valueA > valueB) return -1
    if (valueA < valueB) return 1
    return 0
  }
}

export function useTable({ columns, data, sortState }) {
  const sortedData = useMemo(() => {
    if (sortState.columnIndex < 0) {
      return data
    }
    const column = columns[sortState.columnIndex]
    const sortFunction = sortState.ascending ? sortAscending(column.accessor) : sortDescending(column.accessor)
    return data.toSorted(sortFunction)
  }, [columns, data, sortState])

  const columnModels = useMemo(() => {
    return columns.map((column, columnIndex) => {
      const isSorted = sortState.columnIndex === columnIndex && sortState
      return new ColumnModel(columnIndex, column, isSorted)
    })
  }, [columns, sortState])

  const rowModels = useMemo(() => {
    return sortedData.map((d, rowIndex) => {
      const cells = columnModels.map((column, columnIndex) => {
        return new CellModel(column, columnIndex, d, column.cell)
      })
      return new RowModel(rowIndex, cells)
    })
  }, [columnModels, sortedData])

  return {
    columns: columnModels,
    rows: rowModels,
  }
}

class DefaultCellStyle {
  textAlign = 'text-left'
  padding = 'py-2'
  fontFamily = 'font-sans'
  fontSize = 'text-sm'
  textColor = 'text-neutral-7'
}

class DefaultHeaderCellStyle extends DefaultCellStyle {
  fontWeight = 'font-bold'
  justify = 'justify-start'
  whitespace = 'whitespace-nowrap'
}

class ColumnModel {
  constructor(index, definition, isSorted) {
    this.index = index
    this.definition = definition
    this.isSorted = isSorted
    this.defaultValue = definition.defaultValue
  }

  get id() {
    return this.definition.id || this.header
  }

  get accessor() {
    return this.definition.accessor
  }

  get header() {
    return this.definition.header
  }

  get headerProps() {
    return {
      text: this.header,
      sortable: this.definition.sortable,
      isSorted: this.isSorted,
      ...this.headerCellStyle,
    }
  }

  get headerCellStyle() {
    const definition = this.definition
    const defaultStyle = new DefaultHeaderCellStyle()
    const userStyle = definition.headerCellStyle || definition.cellStyle

    if (userStyle?.textAlign && !userStyle?.button) {
      userStyle.justify = userStyle.textAlign === 'text-left' ? 'justify-start' : 'justify-end'
    }

    if (typeof userStyle === 'object') {
      return Object.assign(defaultStyle, userStyle)
    } else if (typeof userStyle === 'string') {
      return userStyle
    }

    return defaultStyle
  }

  get headerCellClass() {
    if (typeof this.headerCellStyle === 'string') return this.headerCellStyle
    const styles = Object.values(this.headerCellStyle)
    return styles.join(' ')
  }

  get cell() {
    return this.definition.cell
  }

  get cellStyle() {
    const definition = this.definition
    const defaultStyle = new DefaultCellStyle()

    if (typeof definition.cellStyle === 'object') {
      return Object.assign(defaultStyle, definition.cellStyle)
    } else if (typeof definition.cellStyle === 'string') {
      return definition.cellStyle
    }

    return defaultStyle
  }

  get cellClass() {
    if (typeof this.cellStyle === 'string') return this.cellStyle
    const styles = Object.values(this.cellStyle)
    if (this.sortable) {
      styles.push('pr-4')
    }
    return styles.join(' ')
  }
}

class RowModel {
  constructor(index, cells) {
    this.index = index
    this.cells = cells
  }

  get id() {
    return this.index
  }
}

class CellModel {
  constructor(column, columnIndex, row, cell) {
    this.column = column
    this.columnIndex = columnIndex
    this.row = row
    this.cell = cell
  }

  get id() {
    return this.columnIndex
  }

  get displayValue() {
    if (this.cell) {
      return this.cell(this.row)
    }

    if (!Object.prototype.hasOwnProperty.call(this.row, this.column.accessor)) {
      if (this.column.defaultValue) {
        return this.column.defaultValue.toString()
      }

      const rowData = JSON.stringify(this.row, null, 2)
      throw new Error(`Missing value for key ${this.column.accessor} in ${rowData}`)
    }

    return this.row[this.column.accessor].toString()
  }
}
