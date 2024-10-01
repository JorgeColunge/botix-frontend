import React, { useMemo, useState } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel } from '@tanstack/react-table';
import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from './components';
import { PencilSquare, Trash, Telephone, Envelope, ThreeDotsVertical, ChevronDown } from 'react-bootstrap-icons';

export function ColaboradoresDate({ colaboradores, roles, departments, getRoleName, getDepartmentName, handleEditColaboradorClick, handleDeleteColaboradorClick }) {
  const [columnVisibility, setColumnVisibility] = useState({});
  
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
                <Telephone /> 
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
                <Envelope />
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
      accessorKey: 'rol',
      header: 'Rol',
      cell: info => getRoleName(info.getValue())
    },
    {
      accessorKey: 'departamento',
      header: 'Departamento',
      cell: info => getDepartmentName(info.row.original.department_id)
    },
    {
      accessorKey: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const colaborador = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <ThreeDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditColaboradorClick(colaborador)}>
                <PencilSquare className="mr-2 h-6 w-6" /> Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDeleteColaboradorClick(colaborador.id_colaborador)}>
                <Trash className="mr-2 h-6 w-6" style={{ color: 'red' }} /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
  ], [getRoleName, getDepartmentName, handleEditColaboradorClick, handleDeleteColaboradorClick]);

  const table = useReactTable({
    data: colaboradores,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Activando paginación
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-end py-4 justify-end">
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

      <div className="w-full rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {cell.column.columnDef.cell(cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
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
