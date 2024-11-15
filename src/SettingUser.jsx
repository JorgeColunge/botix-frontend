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
import axios from 'axios';
import Swal from 'sweetalert2';
import { List } from 'lucide-react';
import { useMediaQuery } from 'react-responsive';
export const SettingUser = () => {
    const { state, setUsers, setUsuario, setStatus } = useContext(AppContext);
    const { nombre, apellido, telefono, email, rol, link_foto, id_usuario, company_id } = state?.usuario;
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({
      nombre,
      apellido,
      telefono,
      email,
      link_foto,
      rol,
      company_id,
      id_usuario,
      profile : null,
    } || {
        nombre: '',
        apellido: '',
        telefono: 0,
        email: '',
        link_foto: '',
        profile : null,
    });

    const isMobile = useMediaQuery({ maxWidth: 767 });

    useEffect(() => {
       const loadingDates = async() => {
        setUserData({
            nombre,
            apellido,
            telefono,
            email,
            link_foto,
            rol,
            company_id,
            id_usuario,
            profile : null,
          } || {
              nombre: '',
              apellido: '',
              telefono: 0,
              email: '',
              link_foto: '',
              profile : null,
          })
       }
       loadingDates()
    }, [state?.usuario])

    const rolUser = state?.roles?.find(rl => rl.id == rol)
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
          setUserData({ ...userData, profile: file });
        }
      };
    
      const handleUserFormSubmit = async (e) => {
        e.preventDefault();
    
        const {profile, ...updateUser} = userData;
    
        if (profile) {
          const formData = new FormData();
          formData.append('profile', profile);
    
          try {
            const uploadResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/upload-profile`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            updateUser.link_foto = uploadResponse.data.profileUrl;
          } catch (error) {
            Swal.fire({
                title: "Error",
                text: `Error al procesar la Foto. Error: ${error.data}`,
                icon: "error"
              });
            return;
          }
        }
    
        axios.put(`${process.env.REACT_APP_API_URL}/api/auth/users/${updateUser.id_usuario}`, updateUser)
          .then(response => {
            setUsers(state.usuarios.map(user => user.id_usuario === updateUser.id_usuario ? response.data : user));
            setUsuario(response.data)
            Swal.fire({
                title: "Perfecto",
                text: `Tus datos de usuario fueron actualizados.`,
                icon: "success"
              });
          })
          .catch(error => {
            Swal.fire({
                title: "Error",
                text: `Error al modificar datos del perfil: ${error.response.data}`,
                icon: "error"
              });
          });
      };

      return (
        <section> 
          <article className="w-full mt-1 mb-0 flex gap-2">
            <Card className="w-full">
              {isMobile && 
                <CardHeader className="w-full flex items-center">
                  <div className="w-full flex items-center justify-between">
                    <List color="black" size={30} onClick={() => {setStatus(true); console.log("click")}} />
                    <CardTitle className="ml-2">
                      Configuraciones
                    </CardTitle>
                  </div>
                </CardHeader>
              }
            </Card>
          </article>

        <article className="min-h-screen flex items-center justify-center ps-4 pe-2 pt-0 mt-0">
        <Card className="w-full max-w-[100%] md:w-[50%]">
            <CardHeader className="flex justify-between items-center">
             { !isMobile ?  <CardTitle>Configuraciones de Usuario</CardTitle> : null}
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
        <AvatarImage
            src={`${process.env.REACT_APP_API_URL}${userData?.link_foto}`}
            alt={`${userData?.nombre} ${userData?.apellido}`}
            className="w-full h-full object-cover rounded-full"  // Ajustes importantes
        />
        <AvatarFallback>{userData?.nombre?.charAt(0)}{userData?.apellido?.charAt(0)}</AvatarFallback>
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
                        value={userData?.nombre} 
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
                    value={userData?.telefono} 
                    onChange={handleInputChange} 
                    disabled={!isEditing} 
                    />
                </div>
                {/* Campo de Email */}
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="email">Correo</Label>
                    <Input 
                    id="email" 
                    value={userData?.email} 
                    onChange={handleInputChange} 
                    disabled={!isEditing} 
                    />
                </div>
                {/* Campo de Rol */}
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="rol">Rol</Label>
                    <Input id="rol" value={rolUser?.name} readOnly />
                </div>
                {/* Campo de Compañía */}
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="compania">Compañía</Label>
                    <Input id="compania" value={empresa?.name} readOnly />
                </div>
                </div>
            </form>
            </CardContent>
            <CardFooter className="flex justify-between">
            {isEditing && (
                <>
                <Button variant="outline" onClick={handleEditToggle}>Cancelar</Button>
                <Button onClick={handleUserFormSubmit} >Guardar</Button>
                </>
            )}
            </CardFooter>
        </Card>
        </article>
        </section>
      );
    };