import React, { useState, useEffect, useContext } from 'react';
  import {
    Label,
    Input,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Button,
    Separator,
    Avatar,
    AvatarImage,
    AvatarFallback,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
    Tooltip
  } from "./components"
import { AppContext } from './context';
import { Pencil } from 'lucide-react';
export const SettingUser = () => {
    const { state } = useContext(AppContext);
    const { nombre, apellido, telefono, email, rol, link_foto } = state?.usuario;
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({
      nombre,
      apellido,
      telefono,
      email,
      link_foto
    } || {
        nombre: '',
        apellido: '',
        telefono: 0,
        email: '',
        link_foto: ''
    });
     const rolUser = state.roles.find(rl => rl.id == rol)
     const empresa = state.compania;

    // Función para habilitar/deshabilitar modo edición
    const handleEditToggle = () => {
      setIsEditing(!isEditing);
    };
  
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setUserData({ ...userData, [id]: value });
      };
    
      const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const imageUrl = URL.createObjectURL(file);
          setUserData({ ...userData, link_foto: imageUrl });
        }
      };
    
      return (
        <section className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-[90%] md:w-[50%]">
            <CardHeader className="flex justify-between items-center">
            <CardTitle>Configuraciones de Usuario</CardTitle>
            <CardDescription className='d-flex w-full justify-end'>
                <Button variant="icon" onClick={handleEditToggle}>
                <TooltipProvider>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Pencil fill='#2ec426' />
                    </TooltipTrigger>
                    <TooltipContent className="bg-green-500 text-white">
                        Editar usuario
                    </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                </Button>
            </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="mt-4">
            <form>
                <div className="grid w-full items-center gap-4">
                {/* Fila para Nombre, Apellido y Avatar */}
                <div className="flex flex-col md:flex-row space-x-0 md:space-x-4 items-center">
                    {/* Componente Avatar */}
                    <Avatar className="relative w-[7em] h-[7em] cursor-pointer">
                    <label htmlFor="link_foto" className="absolute inset-0 z-10 cursor-pointer">
                        <AvatarImage src={`${process.env.REACT_APP_API_URL}${userData.link_foto}`} alt={`${userData.nombre} ${userData.apellido}`} />
                        <AvatarFallback>{userData.nombre?.charAt(0)}{userData.apellido?.charAt(0)}</AvatarFallback>
                    </label>
                    {isEditing && (
                        <Input
                        type="file"
                        id="link_foto"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 z-20 cursor-pointer"
                        />
                    )}
                    </Avatar>
                    {/* Campos Nombre y Apellido */}
                    <div className="flex flex-col w-full space-y-1.5 mt-4 md:mt-0">
                    <Label htmlFor="nombre">Nombre</Label>
                    <Input 
                        id="nombre" 
                        value={userData.nombre} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                    />
                    </div>
                    <div className="flex flex-col w-full space-y-1.5 mt-4 md:mt-0">
                    <Label htmlFor="apellido">Apellido</Label>
                    <Input 
                        id="apellido" 
                        value={userData.apellido} 
                        onChange={handleInputChange} 
                        disabled={!isEditing} 
                    />
                    </div>
                </div>
                {/* Campo de Telefono */}
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input 
                    id="telefono" 
                    value={userData.telefono} 
                    onChange={handleInputChange} 
                    disabled={!isEditing} 
                    />
                </div>
                {/* Campo de Email */}
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="email">Correo</Label>
                    <Input 
                    id="email" 
                    value={userData.email} 
                    onChange={handleInputChange} 
                    disabled={!isEditing} 
                    />
                </div>
                {/* Campo de Rol */}
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="rol">Rol</Label>
                    <Input id="rol" value={rolUser.name} readOnly />
                </div>
                {/* Campo de Compañía */}
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="compania">Compañía</Label>
                    <Input id="compania" value={empresa.name} readOnly />
                </div>
                </div>
            </form>
            </CardContent>
            <CardFooter className="flex justify-between">
            {isEditing && (
                <>
                <Button variant="outline" onClick={handleEditToggle}>Cancelar</Button>
                <Button>Guardar</Button>
                </>
            )}
            </CardFooter>
        </Card>
        </section>
      );
    };