import React, { useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@shadcn/table';
import { Input, Button, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from './components';
import { ChevronDown, Chat, PencilSquare, Trash, Telephone, Envelope } from 'lucide-react';

export function DataTableDemo({ users, departments, getConversationStats, getRoleName, getDepartmentName, hasPrivilege, handleEditUserClick, handleDeleteUserClick }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Define your table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'link_foto',
      header: 'Foto',
      cell: info => (
        <img 
          src={`${process.env.REACT_APP_API_URL}${info.getValue()}`} 
          alt="Profile" 
          className="profile-user-img"
        />
      )
    },
    {
      accessorKey: 'nombre',
      header: 'Nombre',
      cell: info => info.getValue()
    },
    {
      accessorKey: 'apellido',
      header: 'Apellido',
      cell: info => info.getValue()
    },
    {
      accessorKey: 'telefono',
      header: 'Teléfono',
      cell: info => (
        <a href={`tel:${info.getValue()}`}>
          <Telephone /> {info.getValue()}
        </a>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: info => (
        <a href={`mailto:${info.getValue()}`}>
          <Envelope /> {info.getValue()}
        </a>
      )
    },
    {
      accessorKey: 'rol',
      header: 'Rol',
      cell: info => getRoleName(info.getValue())
    },
    {
      accessorKey: 'department_id',
      header: 'Departamento',
      cell: info => getDepartmentName(info.getValue())
    },
    {
      accessorKey: 'conversations',
      header: 'Conversaciones Asignadas',
      cell: info => {
        const stats = getConversationStats(info.row.original.id_usuario);
        return stats.total_conversations;
      }
    },
    {
      accessorKey: 'pending_conversations',
      header: 'Conversaciones Pendientes',
      cell: info => {
        const stats = getConversationStats(info.row.original.id_usuario);
        return stats.pending_conversations;
      }
    },
    {
      accessorKey: 'attended_conversations',
      header: 'Conversaciones Atendidas',
      cell: info => {
        const stats = getConversationStats(info.row.original.id_usuario);
        return stats.attended_conversations;
      }
    },
    {
      accessorKey: 'acciones',
      header: 'Acciones',
      cell: info => (
        <div>
          <Button variant="link" size="sm" disabled={!hasPrivilege('Send message')}>
            <Chat />
          </Button>
          <Button variant="link" size="sm" onClick={() => handleEditUserClick(info.row.original)} disabled={!hasPrivilege('Edit users')}>
            <PencilSquare />
          </Button>
          {(hasPrivilege('Delete users') || hasPrivilege('Admin')) && (
            <Button variant="link" size="sm" onClick={() => handleDeleteUserClick(info.row.original.id_usuario)}>
              <Trash style={{ color: 'red' }} />
            </Button>
          )}
        </div>
      )
    }
  ], [getConversationStats, getRoleName, getDepartmentName, hasPrivilege, handleEditUserClick, handleDeleteUserClick]);

  // Create the table instance
  const table = useReactTable({
    data: users,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter by email..."
          value={(table.getColumn("email")?.getFilterValue()) ?? ""}
          onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
