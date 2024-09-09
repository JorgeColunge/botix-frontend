import React, { useContext, useMemo, useState } from 'react'
import { AppContext } from './context'
import { Avatar, AvatarFallback, AvatarImage, Input, ScrollArea, SheetClose, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components';
import { useMediaQuery } from 'react-responsive';

export const NewChatContacts = ({selectContact}) => {
    const { state } = useContext(AppContext);
    const [search, setSearch] = useState('');
    const isMobile = useMediaQuery({ maxWidth: 767 });

    // Filtra y ordena los contactos por nombre o número, y agrupa por la primera letra.
    const filteredContacts = useMemo(() => {
      const contactosFiltrados = state.contactos
        .filter(contacto => {
          const firstName = contacto.first_name ? contacto.first_name.toLowerCase() : '';
          const lastName = contacto.last_name ? contacto.last_name.toLowerCase() : '';
          const phoneNumber = contacto.phone_number ? contacto.phone_number : '';
  
          return (
            firstName.includes(search.toLowerCase()) ||
            lastName.includes(search.toLowerCase()) ||
            phoneNumber.includes(search)
          );
        })
        .sort((a, b) => {
          const nameA = a.first_name ? a.first_name.toLowerCase() : '';
          const nameB = b.first_name ? b.first_name.toLowerCase() : '';
          return nameA.localeCompare(nameB);
        });
  
      const agrupados = contactosFiltrados.reduce((acc, contacto) => {
        const firstLetter = contacto.first_name ? contacto.first_name.charAt(0).toUpperCase() : '#';
        if (!acc[firstLetter]) {
          acc[firstLetter] = [];
        }
        acc[firstLetter].push(contacto);
        return acc;
      }, {});
  
      return agrupados;
    }, [state.contactos, search]);

    return (
      <div className='p-0 me-2'>
        <Input 
          type="text"
          placeholder="Buscar por nombre o número"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
  
        {/* Contenedor con scroll */}
        <ScrollArea className="h-[85vh] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow >
                <TableHead>Nombre</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(filteredContacts).map(letter => (
                <React.Fragment key={letter}>
                  <TableRow>
                    <TableCell colSpan={2} className="font-bold text-lg">
                      {letter}
                    </TableCell>
                  </TableRow>
                  {filteredContacts[letter].map((contacto, index) => (
                    <SheetClose className='d-flex gap-3 w-[100vw]' asChild key={index}>
                    <TableRow className={isMobile ? `cursor-pointer w-[100vw]` : `cursor-pointer w-[33em]`} onClick={() => selectContact(contacto)}>
                      <TableCell className='w-100 d-flex gap-2'>
                        <Avatar className="w-[3.5em] h-[3.5em]">
                          <AvatarImage src={`${process.env.REACT_APP_API_URL}${contacto.profile_url}`} alt={`${contacto.last_name}`} />
                          <AvatarFallback>{letter}</AvatarFallback>
                        </Avatar>
                        <span className='flex items-center'>
                            {contacto.first_name} {contacto.last_name}
                        </span>
                      </TableCell>
                      <TableCell className="flex items-center">{contacto.phone_number}</TableCell>
                    </TableRow>
                  </SheetClose>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    );
  };
  