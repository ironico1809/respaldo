from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.http import HttpResponse
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncMonth, TruncDate
from datetime import datetime, timedelta
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.pdfgen import canvas
from io import BytesIO
from Ventas.models import Venta, VentaDetalle
from Producto.models import Producto
from Cliente.models import Cliente

class ReporteLogViewSet(viewsets.ViewSet):
    """ViewSet simplificado sin base de datos"""
    
    @action(detail=False, methods=['get'])
    def mis_reportes(self, request):
        """Obtener reportes del usuario - Retorna lista vacía"""
        return Response([])  # Sin base de datos, retornamos lista vacía
    
    @action(detail=False, methods=['post'])
    def generar_pdf(self, request):
        """Generar reporte PDF mejorado con diseño profesional"""
        try:
            tipo_reporte = request.data.get('tipo', 'ventas')
            fecha_inicio = request.data.get('fecha_inicio')
            fecha_fin = request.data.get('fecha_fin')
            
            # Convertir fechas
            if fecha_inicio:
                fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d')
            else:
                fecha_inicio = datetime.now() - timedelta(days=30)
            
            if fecha_fin:
                fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d')
            else:
                fecha_fin = datetime.now()
            
            # Crear PDF
            buffer = BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
            elements = []
            
            # Estilos
            styles = getSampleStyleSheet()
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#1a56db'),
                spaceAfter=30,
                alignment=TA_CENTER,
                fontName='Helvetica-Bold'
            )
            
            subtitle_style = ParagraphStyle(
                'CustomSubtitle',
                parent=styles['Heading2'],
                fontSize=14,
                textColor=colors.HexColor('#4b5563'),
                spaceAfter=12,
                alignment=TA_CENTER
            )
            
            heading_style = ParagraphStyle(
                'CustomHeading',
                parent=styles['Heading2'],
                fontSize=16,
                textColor=colors.HexColor('#1f2937'),
                spaceAfter=12,
                spaceBefore=12,
                fontName='Helvetica-Bold'
            )
            
            # Título
            elements.append(Paragraph("SMARTSALE", title_style))
            elements.append(Paragraph(f"Reporte de {tipo_reporte.upper()}", subtitle_style))
            elements.append(Paragraph(
                f"Período: {fecha_inicio.strftime('%d/%m/%Y')} - {fecha_fin.strftime('%d/%m/%Y')}", 
                subtitle_style
            ))
            elements.append(Spacer(1, 0.3*inch))
            
            if tipo_reporte == 'ventas':
                # Reporte de ventas
                ventas = Venta.objects.filter(
                    fecha_venta__gte=fecha_inicio,
                    fecha_venta__lte=fecha_fin
                )
                
                total_ventas = ventas.aggregate(total=Sum('monto_total'))['total'] or 0
                cantidad_ventas = ventas.count()
                promedio = ventas.aggregate(promedio=Avg('monto_total'))['promedio'] or 0
                
                # Resumen ejecutivo
                elements.append(Paragraph("RESUMEN EJECUTIVO", heading_style))
                
                data_resumen = [
                    ['Métrica', 'Valor'],
                    ['Total de Ventas', f'{cantidad_ventas} ventas'],
                    ['Monto Total', f'Bs. {total_ventas:,.2f}'],
                    ['Promedio por Venta', f'Bs. {promedio:,.2f}'],
                ]
                
                table_resumen = Table(data_resumen, colWidths=[3*inch, 3*inch])
                table_resumen.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a56db')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 12),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('GRID', (0, 0), (-1, -1), 1, colors.grey),
                    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 1), (-1, -1), 10),
                    ('TOPPADDING', (0, 1), (-1, -1), 8),
                    ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
                ]))
                elements.append(table_resumen)
                elements.append(Spacer(1, 0.3*inch))
                
                # Detalle de ventas
                elements.append(Paragraph("DETALLE DE VENTAS", heading_style))
                
                data_ventas = [['Fecha', 'Cliente', 'Monto', 'Estado']]
                for venta in ventas[:50]:  # Limitar a 50 registros
                    data_ventas.append([
                        venta.fecha_venta.strftime('%d/%m/%Y'),
                        venta.cliente.nombre_completo if venta.cliente else 'N/A',
                        f'Bs. {venta.monto_total:,.2f}',
                        venta.estado
                    ])
                
                if data_ventas:
                    table_ventas = Table(data_ventas, colWidths=[1.2*inch, 2.5*inch, 1.5*inch, 1.3*inch])
                    table_ventas.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a56db')),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 10),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 1), (-1, -1), 9),
                        ('TOPPADDING', (0, 1), (-1, -1), 6),
                        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
                        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
                    ]))
                    elements.append(table_ventas)
                
            elif tipo_reporte == 'productos':
                # Reporte de productos más vendidos
                elements.append(Paragraph("PRODUCTOS MÁS VENDIDOS", heading_style))
                
                productos = VentaDetalle.objects.filter(
                    venta__fecha_venta__gte=fecha_inicio,
                    venta__fecha_venta__lte=fecha_fin
                ).values(
                    'producto__nombre',
                    'producto__precio'
                ).annotate(
                    cantidad_vendida=Sum('cantidad'),
                    total_ventas=Sum('subtotal')
                ).order_by('-cantidad_vendida')[:20]
                
                data_productos = [['Producto', 'Cantidad', 'Total Ventas']]
                for prod in productos:
                    data_productos.append([
                        prod['producto__nombre'],
                        str(prod['cantidad_vendida']),
                        f"Bs. {prod['total_ventas']:,.2f}"
                    ])
                
                if len(data_productos) > 1:
                    table_productos = Table(data_productos, colWidths=[3*inch, 1.5*inch, 2*inch])
                    table_productos.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a56db')),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 10),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 1), (-1, -1), 9),
                        ('TOPPADDING', (0, 1), (-1, -1), 6),
                        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
                        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
                    ]))
                    elements.append(table_productos)
            
            elif tipo_reporte == 'clientes':
                # Reporte de clientes
                elements.append(Paragraph("REPORTE DE CLIENTES", heading_style))
                
                clientes = Cliente.objects.annotate(
                    total_compras=Count('ventas'),
                    monto_total=Sum('ventas__monto_total')
                ).filter(total_compras__gt=0).order_by('-monto_total')[:20]
                
                data_clientes = [['Cliente', 'Email', 'Total Compras', 'Monto Total']]
                for cliente in clientes:
                    data_clientes.append([
                        cliente.nombre_completo,
                        cliente.email,
                        str(cliente.total_compras),
                        f"Bs. {cliente.monto_total or 0:,.2f}"
                    ])
                
                if len(data_clientes) > 1:
                    table_clientes = Table(data_clientes, colWidths=[2*inch, 2*inch, 1*inch, 1.5*inch])
                    table_clientes.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a56db')),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 10),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 1), (-1, -1), 9),
                        ('TOPPADDING', (0, 1), (-1, -1), 6),
                        ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
                        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
                    ]))
                    elements.append(table_clientes)
            
            # Footer
            elements.append(Spacer(1, 0.5*inch))
            footer_style = ParagraphStyle(
                'Footer',
                parent=styles['Normal'],
                fontSize=8,
                textColor=colors.grey,
                alignment=TA_CENTER
            )
            elements.append(Paragraph(
                f"Generado el {datetime.now().strftime('%d/%m/%Y %H:%M:%S')} | SmartSale © 2025",
                footer_style
            ))
            
            # Construir PDF
            doc.build(elements)
            
            # Preparar respuesta
            buffer.seek(0)
            response = HttpResponse(buffer, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="reporte_{tipo_reporte}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pdf"'
            
            return response
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def generar(self, request):
        """Generar un nuevo reporte - redirige a generar_pdf"""
        return self.generar_pdf(request)
