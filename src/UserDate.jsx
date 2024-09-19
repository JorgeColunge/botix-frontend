import React, { useState, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';
import { Input, 
    Button,
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent,
    DropdownMenuCheckboxItem,  
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger, 
    Table, 
    TableHeader, 
    TableRow, 
    TableHead, 
    TableBody, 
    TableCell,  
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator} from './components';
import { ChevronDown, MessageSquareText , Pencil , Trash, Phone, Mail, MoreHorizontal } from 'lucide-react';

export function UserDate({ users, departments, getConversationStats, getRoleName, getDepartmentName, hasPrivilege, handleEditUserClick, handleDeleteUserClick }) {
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
       
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
        <a href={`tel:${info.getValue()}`}>
           <Phone /> 
          </a>
        </TooltipTrigger>
        <TooltipContent>
          <p>{info.getValue()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

      )
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: info => (
        <TooltipProvider>
        <Tooltip>
        <TooltipTrigger asChild>
        <a href={`mailto:${info.getValue()}`}>
                <Mail />
                </a>
        </TooltipTrigger>
        <TooltipContent>
            <p> {info.getValue()}</p>
        </TooltipContent>
        </Tooltip>
        </TooltipProvider>
      )
    },
    {
      accessorKey: 'rol',
      header: 'Rol',
      cell: info => getRoleName(info.getValue())
    },
    {
      accessorKey: 'departamento',
      header: 'Departamento',
      cell: info => getDepartmentName(info.getValue())
    },
    {
      accessorKey: 'conversaciones asignadas',
      header: 'Conversaciones Asignadas',
      cell: info => {
        const stats = getConversationStats(info.row.original.id_usuario);
        return stats.total_conversations;
      }
    },
    {
      accessorKey: 'conversaciones pendientes',
      header: 'Conversaciones Pendientes',
      cell: info => {
        const stats = getConversationStats(info.row.original.id_usuario);
        return stats.pending_conversations;
      }
    },
    {
      accessorKey: 'conversaciones atendidas',
      header: 'Conversaciones Atendidas',
      cell: info => {
        const stats = getConversationStats(info.row.original.id_usuario);
        return stats.attended_conversations;
      }
    },
    {
        accessorKey: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const user = row.original;
      
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem disabled={!hasPrivilege('Send message')}>
                  <Button variant="link" size="sm" disabled={!hasPrivilege('Send message')}>
                    <MessageSquareText />
                    Send message
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditUserClick(user)} disabled={!hasPrivilege('Edit users')}>
                  <Button variant="link" size="sm">
                    <Pencil />
                    Edit user
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(hasPrivilege('Delete users') || hasPrivilege('Admin')) && (
                  <DropdownMenuItem onClick={() => handleDeleteUserClick(user.id_usuario)}>
                    <Button variant="link" size="sm">
                      <Trash style={{ color: 'red' }} />
                      Delete user
                    </Button>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
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
        {/* <Input
          placeholder="Filter by email..."
          value={(table.getColumn("email")?.getFilterValue()) ?? ""}
          onChange={(event) => table.getColumn("email")?.setFilterValue(event.target.value)}
          className="max-w-sm"
        /> */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columnas <ChevronDown className="ml-2 h-4 w-4" />
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
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
