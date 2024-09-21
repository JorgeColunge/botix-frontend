import React, { useState, useMemo, useEffect, useCallback, useContext } from 'react';
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
    DropdownMenuSeparator,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    ScrollArea,
    Separator} from './components';
import { ChevronDown, MessageSquareText , Pencil , Trash, Phone, Mail, MoreHorizontal } from 'lucide-react';
import { Plus } from 'lucide-react';
import { HardDriveUpload } from 'lucide-react';
import axios from 'axios';
import { AppContext } from './context';

export function UserDate({ users, contacts, departments, getConversationStats, getRoleName, getDepartmentName, hasPrivilege, handleEditUserClick, handleDeleteUserClick, handleEditContactClick, handleDeleteContactClick, formatTimeSinceLastMessage, handleCreateContactClick, handleUploadCSVClick, tipo_tabla }) {
  const {state} = useContext(AppContext)
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [phases, setPhases] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [countries, setCountries] = useState([]);
  const [filters, setFilters] = useState({
    phase: '',
    country: '',
    lastContact: '',
  })

  const [transformedContacts, setTransformedContacts] = useState([]);  // Datos transformados originales
  const [filtroContacts, setFilteredContacts] = useState([]);  // Datos filtrados

  useEffect(() => {
    axios.get("https://restcountries.com/v3.1/all")
      .then(response => {
        const countryList = response.data.map((country) => ({
          id: country.cca3, // Código de país
          name: country.name.common, // Nombre del país
        }));
        setCountries(countryList);
      })
      .catch(error => {
        console.error("Error fetching the countries data:", error);
      });
  }, []);
  
  useEffect(() => {
     setPhases(state.fases)
  }, [])
  
// Función para filtrar contactos usando useCallback
  const filterContacts = useCallback((contacts, searchTerm, filters) => {
    let tempContacts = [...contacts];

    // Filtrado por búsqueda
    if (searchTerm) {
      const lowercasedSearch = searchTerm.toLowerCase();
      tempContacts = tempContacts.filter(contact =>
        (contact.nombre?.toLowerCase() || '').includes(lowercasedSearch) ||
        (contact.apellido?.toLowerCase() || '').includes(lowercasedSearch) ||
        (contact.telefono || '').includes(lowercasedSearch) ||
        (contact.correo?.toLowerCase() || '').includes(lowercasedSearch)
      );
    }

    // Filtrado por fase
    if (filters.phase) {
      tempContacts = tempContacts.filter(contact => contact.fase === filters.phase);
    }

    // Filtrado por país
    if (filters.country) {
      tempContacts = tempContacts.filter(contact => contact.nacionalidad === filters.country);
    }

    // Filtrado por último contacto
    if (filters.lastContact) {
      const now = new Date();
      tempContacts = tempContacts.filter(contact => {
        const lastContactDate = new Date(contact.ultimo_mensaje);
        const timeDiff = (now - lastContactDate) / 1000;

        switch (filters.lastContact) {
          case 'today':
            return timeDiff <= 86400;
          case 'yesterday':
            return timeDiff > 86400 && timeDiff <= 172800;
          case 'thisWeek':
            return timeDiff <= 604800;
          case 'lastWeek':
            return timeDiff > 604800 && timeDiff <= 1209600;
          case 'thisMonth':
            return now.getMonth() === lastContactDate.getMonth() && now.getFullYear() === lastContactDate.getFullYear();
          case 'lastMonth':
            const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
            return lastContactDate.getMonth() === lastMonth.getMonth() && lastContactDate.getFullYear() === lastMonth.getFullYear();
          case 'beforeLastMonth':
            return lastContactDate < new Date(now.setMonth(now.getMonth() - 2));
          default:
            return true;
        }
      });
    }

    return tempContacts;
  }, [filters]);

  const handleFilterChange = useCallback((e) => {
    console.log(e.target)
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  }, []);
  
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  
    const filteredContacts = filterContacts(transformedContacts, value, filters);
    setFilteredContacts(filteredContacts);
  };
  
  useEffect(() => {
    const filteredContacts = filterContacts(transformedContacts, searchTerm, filters);
    setFilteredContacts(filteredContacts);
  }, [transformedContacts, searchTerm, filters, filterContacts]);

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
  
      setTransformedContacts(newContacts); 
      setFilteredContacts(newContacts);  
    }
  }, [contacts, tipo_tabla]);
  
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
      accessorKey: 'ultimo_mensaje',
      header: 'Último Mensaje',
      cell: info => info.getValue() ? new Date(info.getValue()).toLocaleString() : '-'
    },
    {
      accessorKey: 'tiempo_ultimo_mensaje',
      header: 'Tiempo Desde Último Contacto',
      cell: info => formatTimeSinceLastMessage(info.getValue())
    },
    {
      accessorKey: 'fase',
      header: 'Fase',
      cell: info => info.getValue()
    },
    {
      accessorKey: 'conversacion',
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

    const columns = tipo_tabla === 'usuarios' ? columnsUser : columnsContact;
    const data = tipo_tabla === 'usuarios' ? users : filtroContacts;

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
      <div className="flex items-end py-4">
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
       
       {
         tipo_tabla == 'contactos' ? (
          <section className='d-flex justify-end w-[70%]'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Filtro por Países <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <ScrollArea className="h-72 w-55 rounded-md border">
                  <div className="p-4">
                  <DropdownMenuRadioGroup value={filters.country} onValueChange={(value) => handleFilterChange({ target: { name: 'country', value } })}>
                    <DropdownMenuRadioItem value="">
                      Todas las fases
                    </DropdownMenuRadioItem>
                    {countries.map((pais) => (
                      <React.Fragment key={pais.id}>
                        <DropdownMenuRadioItem value={pais.name} className="capitalize">
                          {pais.name}
                        </DropdownMenuRadioItem>
                        <Separator className="my-2" />
                      </React.Fragment>
                    ))}
                  </DropdownMenuRadioGroup>
                  </div>
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Filtro por Fase <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={filters.phase} onValueChange={(value) => handleFilterChange({ target: { name: 'phase', value } })}>
                <DropdownMenuRadioItem value="">
                  Todas las fases
                </DropdownMenuRadioItem>
                {phases.map((fase) => (
                  <React.Fragment key={fase.id}>
                    <DropdownMenuRadioItem value={fase.name} className="capitalize">
                      {fase.name}
                    </DropdownMenuRadioItem>
                    <Separator className="my-2" />
                  </React.Fragment>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto">
                  Filtro por último contacto <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={filters.lastContact} onValueChange={(value) => handleFilterChange({ target: { name: 'lastContact', value } })}>
                  <DropdownMenuRadioItem value="">
                    Todos los contactos
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="today">
                    Hoy
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="yesterday">
                    Ayer
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="thisWeek">
                    Esta semana
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="lastWeek">
                    Semana anterior
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="thisMonth">
                    Este mes
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="lastMonth">
                    El mes pasado
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="beforeLastMonth">
                    Antes del mes pasado
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

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
          </section>
        
         ) :(
           
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
         )
       }
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
