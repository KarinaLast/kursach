import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getOrderByUserIdAsync, resetOrderFetchStatus, selectOrderFetchStatus, selectOrders } from '../OrderSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { Button, IconButton, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import {Link} from 'react-router-dom'
import { addToCartAsync, resetCartItemAddStatus, selectCartItemAddStatus, selectCartItems } from '../../cart/CartSlice'
import Lottie from 'lottie-react'
import { loadingAnimation, noOrdersAnimation } from '../../../assets'
import { toast } from 'react-toastify'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {motion} from 'framer-motion'


export const UserOrders = () => {

    const dispatch=useDispatch()
    const loggedInUser=useSelector(selectLoggedInUser)
    const orders=useSelector(selectOrders)
    const cartItems=useSelector(selectCartItems)
    const orderFetchStatus=useSelector(selectOrderFetchStatus)

    const theme=useTheme()
    const is1200=useMediaQuery(theme.breakpoints.down("1200"))
    const is768=useMediaQuery(theme.breakpoints.down("768"))
    const is660=useMediaQuery(theme.breakpoints.down(660))
    const is480=useMediaQuery(theme.breakpoints.down("480"))

    const cartItemAddStatus=useSelector(selectCartItemAddStatus)
    
    useEffect(()=>{
        window.scrollTo({
            top:0,
            behavior:"instant"
        })
    },[])

    useEffect(()=>{
        dispatch(getOrderByUserIdAsync(loggedInUser?._id))
    },[dispatch])


    useEffect(()=>{

        if(cartItemAddStatus==='fulfilled'){
            toast.success("Продукт добавлен в корзину")
        }

        else if(cartItemAddStatus==='rejected'){
            toast.error('Ошибка добавления продукта в корзину, пожалуйста, попробуйте позже')
        }
    },[cartItemAddStatus])

    useEffect(()=>{
        if(orderFetchStatus==='rejected'){
            toast.error("Ошибка при получении заказов, пожалуйста, повторите попытку позже")
        }
    },[orderFetchStatus])

    useEffect(()=>{
        return ()=>{
            dispatch(resetOrderFetchStatus())
            dispatch(resetCartItemAddStatus())
        }
    },[])


    const handleAddToCart=(product)=>{
        const item={user:loggedInUser._id,product:product._id,quantity:1}
        dispatch(addToCartAsync(item))
    }


  return (
    <Stack justifyContent={'center'} alignItems={'center'}>
        {
            orderFetchStatus==='pending'?
            <Stack width={is480?'auto':'25rem'} height={'calc(100vh - 4rem)'} justifyContent={'center'} alignItems={'center'}>
                <Lottie animationData={loadingAnimation}/>
            </Stack>
            :
            <Stack width={is1200?"auto":"60rem"} p={is480?2:4} mb={'5rem'}>
                
                {/* heading and navigation */}
                <Stack flexDirection={'row'} columnGap={2} >
                    {
                        !is480 && <motion.div whileHover={{x:-5}} style={{alignSelf:"center"}}>
                        <IconButton component={Link} to={"/"}><ArrowBackIcon fontSize='large'/></IconButton>
                    </motion.div>
                    }
    

                    <Stack rowGap={1} >
                        <Typography variant='h4' fontWeight={500}>История заказов</Typography>
                        <Typography sx={{wordWrap:"break-word"}} color={'text.secondary'}>Проверяйте статус последних заказов, управляйте возвратом и находите похожие товары.</Typography>
                    </Stack>

                </Stack>

                {/* orders */}
                <Stack mt={5} rowGap={5}>

                        {/* orders mapping */}
                        {
                            orders && orders.map((order)=>(
                                <Stack p={is480?0:2} component={is480?"":Paper} elevation={1} rowGap={2}>
                                    
                                    {/* upper */}
                                    <Stack flexDirection={'row'} rowGap={'1rem'}  justifyContent={'space-between'} flexWrap={'wrap'}>
                                        <Stack flexDirection={'row'} columnGap={4} rowGap={'1rem'} flexWrap={'wrap'}>
                                            <Stack>
                                                <Typography>Номер заказа</Typography>
                                                <Typography color={'text.secondary'}>{order._id}</Typography>
                                            </Stack>

                                            <Stack>
                                                <Typography>Дата размещения</Typography>
                                                <Typography color={'text.secondary'}>{new Date(order.createdAt).toDateString()}</Typography>
                                            </Stack>

                                            <Stack>
                                                <Typography>Общая сумма</Typography>
                                                <Typography>{order.total} руб.</Typography>
                                            </Stack>
                                        </Stack>

                                        <Stack>
                                            <Typography>Количество: {order.item.length}</Typography>
                                        </Stack>
                                    </Stack>

                                    {/* middle */}
                                    <Stack rowGap={2}>

                                        {
                                            order.item.map((product)=>(
                                                
                                                <Stack mt={2} flexDirection={'row'} rowGap={is768?'2rem':''} columnGap={4} flexWrap={is768?"wrap":"nowrap"}>
                                                    
                                                    <Stack>
                                                        <img style={{width:"100%",aspectRatio:is480?3/2:1/1,objectFit:"contain"}} src={product.product.images[0]} alt="" />
                                                    </Stack>

                                                    <Stack rowGap={1} width={'100%'}>

                                                        <Stack flexDirection={'row'} justifyContent={'space-between'}>
                                                            <Stack>
                                                                <Typography variant='h6' fontSize={'1rem'} fontWeight={500}>{product.product.title}</Typography>
                                                                <Typography variant='body1'  fontSize={'.9rem'}  color={'text.secondary'}>{product.product.brand.name}</Typography>
                                                                <Typography color={'text.secondary'} fontSize={'.9rem'}>Qty: {product.quantity}</Typography>
                                                            </Stack>
                                                            <Typography>{product.product.price} руб.</Typography>
                                                        </Stack>

                                                        <Typography color={'text.secondary'}>{product.product.description}</Typography>

                                                        <Stack mt={2} alignSelf={is480?"flex-start":'flex-end'} flexDirection={'row'} columnGap={2} >
                                                            <Button size='small' component={Link} to={`/product-details/${product.product._id}`} variant='outlined'>Посмотреть</Button>
                                                            {
                                                                cartItems.some((cartItem)=>cartItem.product._id===product.product._id)?
                                                                <Button  size='small' variant='contained' component={Link} to={"/cart"}>Уже в корзине</Button>
                                                                :<Button  size='small' variant='contained' onClick={()=>handleAddToCart(product.product)}>Купить снова</Button>
                                                            }
                                                        </Stack>

                                                    </Stack>



                                                </Stack>
                                            ))
                                        }

                                    </Stack>

                                    {/* lower */}
                                    <Stack mt={2} flexDirection={'row'} justifyContent={'space-between'}>
                                        <Typography mb={2}>Status : {order.status}</Typography>
                                    </Stack>
                                        
                                </Stack>
                            ))

                        }
                        
                        {/* no orders animation */}
                        {
                        !orders.length && 
                            <Stack mt={is480?'2rem':0} mb={'7rem'} alignSelf={'center'} rowGap={2}>

                                <Stack width={is660?"auto":'30rem'} height={is660?"auto":'30rem'}>
                                    <Lottie animationData={noOrdersAnimation}/>
                                </Stack>

                                <Typography textAlign={'center'} alignSelf={'center'} variant='h6' >о! Похоже, в последнее время вы не ходили по магазинам</Typography>

                            </Stack>
                        }

                </Stack>
            
            </Stack>
        
        }

    </Stack>
  )
}
