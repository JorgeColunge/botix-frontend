import React, { useState, useMemo, useEffect } from 'react';
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
import { Plus } from 'lucide-react';
import { HardDriveUpload } from 'lucide-react';

export function UserDate({ users, contacts, departments, getConversationStats, getRoleName, getDepartmentName, hasPrivilege, handleEditUserClick, handleDeleteUserClick, handleEditContactClick, handleDeleteContactClick, formatTimeSinceLastMessage, handleCreateContactClick, handleUploadCSVClick, tipo_tabla }) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [transformedContacts, setTransformedContacts] = useState([]);  // Datos transformados originales
  const [filtroContacts, setFilteredContacts] = useState([]);  // Datos filtrados
  
  // Función para filtrar los contactos
  const filterContacts = (contacts, searchTerm) => {
    if (!searchTerm) return contacts;  // Si no hay búsqueda, devuelve todos los contactos
  
    const lowercasedSearch = searchTerm.toLowerCase();
  
    return contacts.filter(contact =>
      (contact.nombre?.toLowerCase() || '').includes(lowercasedSearch) ||
      (contact.apellido?.toLowerCase() || '').includes(lowercasedSearch) ||
      (contact.telefono || '').includes(lowercasedSearch) ||
      (contact.correo?.toLowerCase() || '').includes(lowercasedSearch)
    );
  };
  
  // Uso de la función para actualizar el estado filtrado
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  
    // Filtra los contactos transformados
    const filteredContacts = filterContacts(transformedContacts, value);
    setFilteredContacts(filteredContacts);
  };
  
  // Se ejecuta cuando `contacts` o `tipo_tabla` cambian, y transforma los contactos
  useEffect(() => {
    if (tipo_tabla === 'contactos') {
      const newContacts = contacts.map(contacto => {
        const { first_name, last_name, phone_number, direccion_completa, email, ciudad_residencia, last_message_time, time_since_last_message, phase_name, has_conversation, ...rest } = contacto;
        return {
          ...rest,
          nombre: first_name,
          apellido: last_name,
          telefono: phone_number,
          direccion: direccion_completa,
          correo: email,
          ciudad: ciudad_residencia,
          ultimo_mensaje: last_message_time,
          tiempo_ultimo_mensaje: time_since_last_message,
          fase: phase_name,
          conversacion: has_conversation,
        };
      });
  
      setTransformedContacts(newContacts);  // Guarda los contactos transformados
      setFilteredContacts(newContacts);  // Inicialmente, los contactos filtrados son todos
    }
  }, [contacts, tipo_tabla]);
  
  // Define your table columns
  const columnsUser  = useMemo(() => [
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
        cell: info => {
          const departmentId = info.row.original.department_id;
          return getDepartmentName(departmentId);
        }
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
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem disabled={!hasPrivilege('Send message')}>
                  <Button variant="link" size="sm" disabled={!hasPrivilege('Send message')}>
                    <MessageSquareText className="mr-2 h-6 w-6"/>
                    Enviar mensaje
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditUserClick(user)} disabled={!hasPrivilege('Edit users')}>
                  <Button variant="link" size="sm">
                    <Pencil className="mr-2 h-6 w-6"/>
                    Editar
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(hasPrivilege('Delete users') || hasPrivilege('Admin')) && (
                  <DropdownMenuItem onClick={() => handleDeleteUserClick(user.id_usuario)}>
                    <Button variant="link" size="sm">
                      <Trash style={{ color: 'red' }} className="mr-2 h-6 w-6"/>
                      Eliminar
                    </Button>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
      }
      
  ], [getConversationStats, getRoleName, getDepartmentName, hasPrivilege, handleEditUserClick, handleDeleteUserClick]);

   // Define your columns for 'contactos' table
   const columnsContact = useMemo(() => [
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
      accessorKey: 'correo',
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
      accessorKey: 'direccion',
      header: 'Dirección',
      cell: info => info.getValue()
    },
    {
      accessorKey: 'ciudad',
      header: 'Ciudad',
      cell: info => info.getValue()
    },
    {
      accessorKey: 'nacionalidad',
      header: 'País',
      cell: info => info.getValue()
    },
    {
      accessorKey: 'last_message_time',
      header: 'Último Mensaje',
      cell: info => info.getValue() ? new Date(info.getValue()).toLocaleString() : '-'
    },
    {
      accessorKey: 'time_since_last_message',
      header: 'Tiempo Desde Último Contacto',
      cell: info => formatTimeSinceLastMessage(info.getValue())
    },
    {
      accessorKey: 'phase_name',
      header: 'Fase',
      cell: info => info.getValue()
    },
    {
      accessorKey: 'has_conversation',
      header: 'Conversación',
      cell: info => info.getValue() ? 'Sí' : 'No'
    },
    {
      accessorKey: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuItem >
                  <Button variant="link" size="sm">
                    <MessageSquareText className="mr-2 h-6 w-6"/>
                    Enviar mensaje
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditContactClick(contact)}>
                  <Button variant="link" size="sm">
                    <Pencil className="mr-2 h-6 w-6"/>
                    Editar
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {
                  <DropdownMenuItem onClick={() => handleDeleteContactClick(contact.id_usuario)}>
                    <Button variant="link" size="sm">
                      <Trash style={{ color: 'red' }} className="mr-2 h-6 w-6"/>
                      Eliminar
                    </Button>
                  </DropdownMenuItem>
                }
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      }
    }
  ], [handleEditContactClick, handleDeleteContactClick]);

    // Conditionally set the columns and data based on tipo_tabla
    const columns = tipo_tabla === 'usuarios' ? columnsUser : columnsContact;
    const data = tipo_tabla === 'usuarios' ? users : filtroContacts;
  // Create the table instance
  const table = useReactTable({
    data,
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
       {
         tipo_tabla == 'contactos' ? (
           <section className=' d-flex row gap-2 w-[30%]'>
            <article className='d-flex gap-2'>
              <Button className='bg-fuchsia-600 hover:bg-fuchsia-700 text-white w-100' onClick={handleCreateContactClick}>
                <Plus className="mr-2 h-6 w-6"/> Crear contacto
              </Button>
            <Button className='bg-zinc-600 hover:bg-zinc-700 text-white w-100' onClick={handleUploadCSVClick}>
              <HardDriveUpload className="mr-2 h-6 w-6"/> Cargar CSV
            </Button>
            </article>
            <article className='w-100'>
            <Input
                placeholder="Buscar por nombre, apellido, teléfono o correo"
                value={searchTerm}
                onChange={handleSearch}
                className="max-w-100"
              />
            </article>

        </section>
        ) : (
          <>
          </>
        )
       }
 
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
