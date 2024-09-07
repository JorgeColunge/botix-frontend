import React, { useContext, useMemo, useState } from 'react'
import { AppContext } from './context'
import { Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components';

export const NewChatContacts = () => {
    const { state } = useContext(AppContext);
    const [search, setSearch] = useState('');
  
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
      <div>
        <Input 
          type="text"
          placeholder="Buscar por nombre o número"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
  
        {/* Contenedor con scroll */}
        <div className="max-h-[85vh] overflow-y-auto pe-0 me-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Número</TableHead>
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
                    <TableRow key={index} className='cursor-pointer'>
                      <TableCell>{contacto.first_name} {contacto.last_name}</TableCell>
                      <TableCell>{contacto.phone_number}</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };
  