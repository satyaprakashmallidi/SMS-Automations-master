import PropTypes from 'prop-types'
import { Edit2, Trash2 } from 'lucide-react'
import * as Icons from 'lucide-react'
import Table from '../ui/Table'
import Badge from '../ui/Badge'

function TagTable({ tags, sortColumn = 'name', sortDirection = 'asc', onSort, onEdit, onDelete }) {
  const columns = [
    {
      key: 'name',
      label: 'Tag Name',
      sortable: true,
      className: 'w-48',
      render: (tag) => {
        const IconComponent = Icons[tag.icon] || Icons.Tag
        return (
          <div className="flex items-center gap-2">
            <IconComponent
              className="w-5 h-5 flex-shrink-0"
              style={{ color: tag.color }}
            />
            <span className="font-medium text-gray-900 whitespace-nowrap">{tag.name}</span>
          </div>
        )
      },
    },
    {
      key: 'definition',
      label: 'Definition',
      sortable: false,
      className: 'w-64',
      render: (tag) => (
        <div className="text-sm text-gray-600 truncate" title={tag.definition}>
          {tag.definition}
        </div>
      ),
    },
    {
      key: 'trigger',
      label: 'Trigger',
      sortable: false,
      className: 'w-48',
      render: (tag) => (
        <div className="text-sm text-gray-600 truncate" title={tag.trigger}>
          {tag.trigger}
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      className: 'w-24',
      render: (tag) => (
        <Badge variant={tag.type} size="sm">
          {tag.type}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      className: 'w-24',
      render: (tag) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(tag)}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
            title="Edit tag"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(tag.id)}
            className="p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded transition-colors flex-shrink-0"
            title="Delete tag"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={tags}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={onSort}
    />
  )
}

TagTable.propTypes = {
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      definition: PropTypes.string.isRequired,
      trigger: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    })
  ).isRequired,
  sortColumn: PropTypes.string,
  sortDirection: PropTypes.string,
  onSort: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

export default TagTable
