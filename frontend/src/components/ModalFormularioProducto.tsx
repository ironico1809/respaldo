import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import './ModalFormularioProducto.css';

interface Producto {
    id?: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    estado: 'Activo' | 'Inactivo';
    categoria: number;
}

interface Categoria {
    id: number;
    nombre: string;
}

interface ModalFormularioProductoProps {
    abierto: boolean;
    alCerrar: () => void;
    alGuardar: (producto: Omit<Producto, 'id'> | Producto) => void;
    producto: Producto | null;
    categorias: Categoria[];
}

const ModalFormularioProducto: React.FC<ModalFormularioProductoProps> = ({ abierto, alCerrar, alGuardar, producto, categorias }) => {
    const { control, handleSubmit, reset, formState: { errors } } = useForm<Producto>();

    const esModoEdicion = producto !== null;

    useEffect(() => {
        if (abierto) {
            if (producto) {
                reset(producto);
            } else {
                reset({
                    nombre: '',
                    descripcion: '',
                    precio: 0,
                    stock: 0,
                    estado: 'Activo',
                    categoria: categorias.length > 0 ? categorias[0].id : 0
                });
            }
        }
    }, [producto, abierto, reset, categorias]);

    const alEnviar = (datos: Producto) => {
        alGuardar(datos);
    };

    return (
        <Modal isOpen={abierto} onClose={alCerrar} title={esModoEdicion ? 'Editar Producto' : 'Añadir Nuevo Producto'}>
            <form onSubmit={handleSubmit(alEnviar)} className="modal-formulario-producto-form">
                {errors.nombre && <p className="form-error-message">{errors.nombre.message}</p>}
                {errors.precio && <p className="form-error-message">{errors.precio.message}</p>}
                {errors.stock && <p className="form-error-message">{errors.stock.message}</p>}
                {errors.categoria && <p className="form-error-message">{errors.categoria.message}</p>}

                <div className="form-grid">
                    <Controller
                        name="nombre"
                        control={control}
                        defaultValue=""
                        rules={{ required: 'El nombre es requerido' }}
                        render={({ field }) => (
                            <Input {...field} id="nombre" label="Nombre del Producto" className="full-width" />
                        )}
                    />

                    <Controller
                        name="descripcion"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <Input {...field} id="descripcion" label="Descripción" className="full-width" />
                        )}
                    />

                    <Controller
                        name="precio"
                        control={control}
                        defaultValue={0}
                        rules={{ required: 'El precio es requerido', min: { value: 0.01, message: 'El precio debe ser mayor a 0' } }}
                        render={({ field }) => (
                            <Input {...field} id="precio" label="Precio" type="number" />
                        )}
                    />

                    <Controller
                        name="stock"
                        control={control}
                        defaultValue={0}
                        rules={{ required: 'El stock es requerido', min: { value: 0, message: 'El stock no puede ser negativo' } }}
                        render={({ field }) => (
                            <Input {...field} id="stock" label="Stock" type="number" />
                        )}
                    />

                    <div className="form-group">
                        <label htmlFor="categoria">Categoría</label>
                        <Controller
                            name="categoria"
                            control={control}
                            rules={{ required: 'La categoría es requerida' }}
                            render={({ field }) => (
                                <select {...field} id="categoria" className="form-select">
                                    <option value="">Seleccione una categoría</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                    ))}
                                </select>
                            )}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="estado">Estado</label>
                        <Controller
                            name="estado"
                            control={control}
                            defaultValue="Activo"
                            render={({ field }) => (
                                <select {...field} id="estado" className="form-select">
                                    <option value="Activo">Activo</option>
                                    <option value="Inactivo">Inactivo</option>
                                </select>
                            )}
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <Button type="button" className="btn-secondary" onClick={alCerrar}>Cancelar</Button>
                    <Button type="submit" className="btn-primary">{esModoEdicion ? 'Guardar Cambios' : 'Registrar Producto'}</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ModalFormularioProducto;