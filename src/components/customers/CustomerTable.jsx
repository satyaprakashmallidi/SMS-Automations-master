import PropTypes from 'prop-types'
import { Edit2, MoreHorizontal, Phone, Calendar, DollarSign } from 'lucide-react'
import * as Icons from 'lucide-react'
import Badge from '../ui/Badge'
import { formatCurrency, formatDate, formatPhoneNumber } from '../../utils/formatters'

function CustomerTable({ customers, sortColumn, sortDirection, onSort, onEdit, onDelete, availableTags = [] }) {
  // Helper to get tag details
  const getTagById = (tagId) => availableTags.find((t) => t.id === tagId)

  // Helper for sort icons
  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return <div className="w-4 h-4" /> // Placeholder
    return (
      <span className={`ml-1 transition-transform ${sortDirection === 'desc' ? 'rotate-180' : ''}`}>
        ▼
      </span>
    )
  }

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <Icons.Users className="w-8 h-8 text-gray-300" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">No customers found</h3>
      <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
    </div>
  )

  return (
    <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 border-t-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] table-fixed text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th 
                className="w-[18%] px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => onSort('name')}
              >
                <div className="flex items-center">Customer <SortIcon column="name" /></div>
              </th>
              
              <th className="w-[15%] px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contact
              </th>

              <th 
                className="w-[10%] px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => onSort('status')}
              >
                <div className="flex items-center">Status <SortIcon column="status" /></div>
              </th>

              <th 
                className="w-[10%] px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => onSort('type')}
              >
                <div className="flex items-center">Type <SortIcon column="type" /></div>
              </th>

              <th className="w-[15%] px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tags
              </th>

              <th 
                className="w-[12%] px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => onSort('lastService')}
              >
                <div className="flex items-center">Last Service <SortIcon column="lastService" /></div>
              </th>

              <th 
                className="w-[10%] px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 text-right"
                onClick={() => onSort('totalSpent')}
              >
                <div className="flex items-center justify-end">Total Spent <SortIcon column="totalSpent" /></div>
              </th>

              <th className="w-[10%] px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-50">
            {customers.length > 0 ? (
              customers.map((customer) => (
                <tr key={customer.id} className="group hover:bg-gray-50/80 transition-colors">
                  
                  {/* Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mr-3">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-medium text-gray-900 truncate" title={customer.name}>
                          {customer.name}
                        </div>
                        {/* Address hidden by default to keep single line, optional tooltip */}
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                     <div className="flex items-center text-sm text-gray-600 truncate">
                        <Phone className="w-3 h-3 mr-1.5 text-gray-400" />
                        {formatPhoneNumber(customer.phone)}
                     </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <Badge variant={customer.status} size="sm">{customer.status}</Badge>
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                     <Badge variant={customer.type.toLowerCase()} size="sm">{customer.type}</Badge>
                  </td>

                  {/* Tags */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 overflow-hidden h-6">
                      {customer.tags && customer.tags.length > 0 ? (
                        customer.tags.map((tagId) => {
                          const tag = getTagById(tagId)
                          if (!tag) return null
                          const IconComponent = Icons[tag.icon] || Icons.Tag
                          return (
                            <div
                              key={tagId}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-white whitespace-nowrap flex-shrink-0"
                              style={{ backgroundColor: tag.color }}
                              title={tag.name}
                            >
                              <IconComponent className="w-3 h-3" />
                              <span className="max-w-[80px] truncate">{tag.name}</span>
                            </div>
                          )
                        })
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </div>
                  </td>

                  {/* Last Service */}
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                      {customer.lastService ? formatDate(customer.lastService) : 'Never'}
                    </div>
                  </td>

                  {/* Total Spent */}
                  <td className="px-6 py-4 text-right">
                    <div className="font-medium text-gray-900 flex items-center justify-end">
                      {formatCurrency(customer.totalSpent)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(customer)}
                        className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(customer.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Icons.Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8">
                  <EmptyState />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Simple Pagination Footer (Visual Only for now) */}
      {customers.length > 0 && (
        <div className="bg-gray-50/50 px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>Showing {customers.length} customers</div>
          <div className="flex gap-2">
             <button className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50" disabled>Previous</button>
             <button className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      )}
    </div>
  )
}

CustomerTable.propTypes = {
  customers: PropTypes.array.isRequired,
  sortColumn: PropTypes.string.isRequired,
  sortDirection: PropTypes.string.isRequired,
  onSort: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  availableTags: PropTypes.array,
}

export default CustomerTable