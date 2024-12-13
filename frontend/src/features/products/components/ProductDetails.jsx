import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { clearSelectedProduct, fetchProductByIdAsync, resetProductFetchStatus, selectProductFetchStatus, selectSelectedProduct } from '../ProductSlice'
import { Box,Checkbox,Rating, Stack,Typography, useMediaQuery,Button,Paper} from '@mui/material'
import { addToCartAsync, resetCartItemAddStatus, selectCartItemAddStatus, selectCartItems } from '../../cart/CartSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { fetchReviewsByProductIdAsync,resetReviewFetchStatus,selectReviewFetchStatus,selectReviews,} from '../../review/ReviewSlice'
import { Reviews } from '../../review/components/Reviews'
import {toast} from 'react-toastify'
import {MotionConfig, motion} from 'framer-motion'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined';
import Favorite from '@mui/icons-material/Favorite'
import { createWishlistItemAsync, deleteWishlistItemByIdAsync, resetWishlistItemAddStatus, resetWishlistItemDeleteStatus, selectWishlistItemAddStatus, selectWishlistItemDeleteStatus, selectWishlistItems } from '../../wishlist/WishlistSlice'
import { useTheme } from '@mui/material'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import MobileStepper from '@mui/material/MobileStepper';
import Lottie from 'lottie-react'
import {loadingAnimation} from '../../../assets'


const SIZES=['Мягкий','Твердый']
const AutoPlaySwipeableViews = autoPlay(SwipeableViews);


export const ProductDetails = () => {
    const {id}=useParams()
    const product=useSelector(selectSelectedProduct)
    const loggedInUser=useSelector(selectLoggedInUser)
    const dispatch=useDispatch()
    const cartItems=useSelector(selectCartItems)
    const cartItemAddStatus=useSelector(selectCartItemAddStatus)
    const [quantity,setQuantity]=useState(1)
    const [selectedSize,setSelectedSize]=useState('')
    const [selectedColorIndex,setSelectedColorIndex]=useState(-1)
    const reviews=useSelector(selectReviews)
    const [selectedImageIndex,setSelectedImageIndex]=useState(0)
    const theme=useTheme()
    const is1420=useMediaQuery(theme.breakpoints.down(1420))
    const is990=useMediaQuery(theme.breakpoints.down(990))
    const is840=useMediaQuery(theme.breakpoints.down(840))
    const is500=useMediaQuery(theme.breakpoints.down(500))
    const is480=useMediaQuery(theme.breakpoints.down(480))
    const is387=useMediaQuery(theme.breakpoints.down(387))
    const is340=useMediaQuery(theme.breakpoints.down(340))

    const wishlistItems=useSelector(selectWishlistItems)



    const isProductAlreadyInCart=cartItems.some((item)=>item.product._id===id)
    const isProductAlreadyinWishlist=wishlistItems.some((item)=>item.product._id===id)

    const productFetchStatus=useSelector(selectProductFetchStatus)
    const reviewFetchStatus=useSelector(selectReviewFetchStatus)

    const totalReviewRating=reviews.reduce((acc,review)=>acc+review.rating,0)
    const totalReviews=reviews.length
    const averageRating=parseInt(Math.ceil(totalReviewRating/totalReviews))

    const wishlistItemAddStatus=useSelector(selectWishlistItemAddStatus)
    const wishlistItemDeleteStatus=useSelector(selectWishlistItemDeleteStatus)

    useEffect(()=>{
        window.scrollTo({
            top:0,
            behavior:"instant"
        })
    },[])

    useEffect(()=>{
        if(id){
            dispatch(fetchProductByIdAsync(id))
            dispatch(fetchReviewsByProductIdAsync(id))
        }
    },[id])

    useEffect(()=>{

        if(cartItemAddStatus==='fulfilled'){
            toast.success("Продукт добавлен в корзину")
        }

        else if(cartItemAddStatus==='rejected'){
            toast.error('Ошибка при добавлении товара в корзину, пожалуйста, повторите попытку позже')
        }
    },[cartItemAddStatus])

    useEffect(()=>{
        if(wishlistItemAddStatus==='fulfilled'){
            toast.success("Товар добавлен в список желаний")
        }
        else if(wishlistItemAddStatus==='rejected'){
            toast.error("Ошибка при добавлении товара в список желаний, пожалуйста, повторите попытку позже")
        }
    },[wishlistItemAddStatus])

    useEffect(()=>{
        if(wishlistItemDeleteStatus==='fulfilled'){
            toast.success("Товар удален из списка желаний")
        }
        else if(wishlistItemDeleteStatus==='rejected'){
            toast.error("Ошибка при удалении товара из списка желаний, пожалуйста, повторите попытку позже")
        }
    },[wishlistItemDeleteStatus])

    useEffect(()=>{
        if(productFetchStatus==='rejected'){
            toast.error("Ошибка при получении сведений о продукте, пожалуйста, повторите попытку позже")
        }
    },[productFetchStatus])

    useEffect(()=>{
        if(reviewFetchStatus==='rejected'){
            toast.error("Ошибка при получении отзывов о продукте, пожалуйста, повторите попытку позже")
        }
    },[reviewFetchStatus])

    useEffect(()=>{
        return ()=>{
            dispatch(clearSelectedProduct())
            dispatch(resetProductFetchStatus())
            dispatch(resetReviewFetchStatus())
            dispatch(resetWishlistItemDeleteStatus())
            dispatch(resetWishlistItemAddStatus())
            dispatch(resetCartItemAddStatus())
        }
    },[])

    const handleAddToCart=()=>{
        const item={user:loggedInUser._id,product:id,quantity}
        dispatch(addToCartAsync(item))
        setQuantity(1)
    }

    const handleDecreaseQty=()=>{
        if(quantity!==1){
            setQuantity(quantity-1)
        }
    }

    const handleIncreaseQty=()=>{
        if(quantity<20 && quantity<product.stockQuantity){
            setQuantity(quantity+1)
        }
    }

    const handleSizeSelect=(size)=>{
        setSelectedSize(size)
    }

    const handleAddRemoveFromWishlist=(e)=>{
        if(e.target.checked){
            const data={user:loggedInUser?._id,product:id}
            dispatch(createWishlistItemAsync(data))
        }

        else if(!e.target.checked){
            const index=wishlistItems.findIndex((item)=>item.product._id===id)
            dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id));
        }
    }

    const [activeStep, setActiveStep] = React.useState(0);
    const maxSteps = product?.images.length;

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleStepChange = (step) => {
        setActiveStep(step);
    };


  return (
    <>
    {!(productFetchStatus==='rejected' && reviewFetchStatus==='rejected') && <Stack sx={{justifyContent:'center',alignItems:'center',mb:'2rem',rowGap:"2rem"}}>
        {
            (productFetchStatus || reviewFetchStatus) === 'pending'?
            <Stack width={is500?"35vh":'25rem'} height={'calc(100vh - 4rem)'} justifyContent={'center'} alignItems={'center'}>
                <Lottie animationData={loadingAnimation}/>
            </Stack>
            :
            <Stack>

                {/* product details */}
                <Stack width={is480?"auto":is1420?"auto":'88rem'} p={is480?2:0} height={is840?"auto":"50rem"} rowGap={5} mt={is840?0:5} justifyContent={'center'} mb={5} flexDirection={is840?"column":"row"} columnGap={is990?"2rem":"5rem"}>

                    {/* left stack (images) */}
                    <Stack  sx={{flexDirection:"row",columnGap:"2.5rem",alignSelf:"flex-start",height:"100%"}}>

                        {/* image selection */}
                        {!is1420 && <Stack sx={{display:"flex",rowGap:'1.5rem',height:"100%",overflowY:"scroll"}}>
                            {
                                product && product.images.map((image,index)=>(
                                    <motion.div  whileHover={{scale:1.1}} whileTap={{scale:1}} style={{width:"200px",cursor:"pointer"}} onClick={()=>setSelectedImageIndex(index)}>
                                        <img style={{width:"100%",objectFit:"contain"}} src={image} alt={`${product.title} image`} />
                                    </motion.div>
                                ))
                            }
                        </Stack>}

                        {/* selected image */}
                        <Stack mt={is480?"0rem":'5rem'}>
                            {
                                is1420?
                                <Stack width={is480?"100%":is990?'400px':"500px"} >
                                    <AutoPlaySwipeableViews width={'100%'} height={'100%'} axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={activeStep} onChangeIndex={handleStepChange} enableMouseEvents >
                                        {
                                        product?.images.map((image,index) => (
                                        <div key={index} style={{width:"100%",height:'100%'}}>
                                            {
                                            Math.abs(activeStep - index) <= 2
                                                ?
                                                <Box component="img" sx={{width:'100%',objectFit:"contain",overflow:"hidden",aspectRatio:1/1}} src={image} alt={product?.title} />
                                                :
                                                null
                                            }
                                        </div>
                                        ))
                                        }
                                    </AutoPlaySwipeableViews>

                                    <MobileStepper steps={maxSteps} position="static" activeStep={activeStep} nextButton={<Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1} >Next{theme.direction === 'rtl' ? (<KeyboardArrowLeft />) : (<KeyboardArrowRight />)}</Button>} backButton={<Button size="small" onClick={handleBack} disabled={activeStep === 0}>{theme.direction === 'rtl' ? (<KeyboardArrowRight />) : (<KeyboardArrowLeft />)}Back</Button>}/>
                                </Stack>
                                :
                                <div style={{width:"100%"}}>
                                    <img style={{width:"100%",objectFit:"contain",aspectRatio:1/1}} src={product?.images[selectedImageIndex]} alt={`${product?.title} image`} />
                                </div>
                            }
                        </Stack>

                    </Stack>

                    {/* right stack - about product */}
                    <Stack rowGap={"1.5rem"} width={is480?"100%":'25rem'}>

                        {/* title rating price */}
                        <Stack rowGap={".5rem"}>

                            {/* title */}
                            <Typography variant='h4' fontWeight={600}>{product?.title}</Typography>

                            {/* rating */}
                            <Stack sx={{flexDirection:"row",columnGap:is340?".5rem":"1rem",alignItems:"center",flexWrap:'wrap',rowGap:'1rem'}}>
                                <Rating value={averageRating} readOnly/>
                                <Typography>( {totalReviews===0?"Нет отзывов":totalReviews===1?`${totalReviews} Отзыв`:`${totalReviews} Отзывы`} )</Typography>
                                <Typography color={product?.stockQuantity<=10?"error":product?.stockQuantity<=20?"orange":"green"}>{product?.stockQuantity<=10?`Only ${product?.stockQuantity} left`:product?.stockQuantity<=20?"Осталось совсем немного":"В наличии"}</Typography>
                            </Stack>

                            {/* price */}
                            <Typography variant='h5'>{product?.price} руб.</Typography>
                        </Stack>

                        {/* description */}
                        <Stack rowGap={".8rem"}>
                            <Typography>{product?.description}</Typography>
                            <hr />
                        </Stack>


                        {/* size and add-to-cart */}
                        {
                            !loggedInUser?.isAdmin &&

                        <Stack sx={{rowGap:"1.3rem"}} width={'fit-content'}>
                            {/* Size Selection */}
                            <Stack flexDirection={'column'} rowGap={'1rem'}>
                                <Typography>Переплет:</Typography>
                                <Stack flexDirection={'row'} columnGap={'1rem'}>
                                    {SIZES.map((size) => (
                                        <Button
                                            key={size}
                                            variant={selectedSize === size ? 'contained' : 'outlined'}
                                            onClick={() => handleSizeSelect(size)}
                                        >
                                            {size}
                                        </Button>
                                    ))}
                                </Stack>
                            </Stack>

                            {/* quantity , add to cart and wishlist */}
                            <Stack flexDirection={"row"} columnGap={is387?".3rem":"1.5rem"} width={'100%'} >

                                {/* qunatity */}
                                <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>

                                    <MotionConfig whileHover={{scale:1.050}} whileTap={{scale:1}}>
                                        <motion.button onClick={handleDecreaseQty}  style={{padding:"10px 15px",fontSize:"1.050rem",backgroundColor:"",color:"black",outline:"none",border:'1px solid black',borderRadius:"8px"}}>-</motion.button>
                                        <p style={{margin:"0 1rem",fontSize:"1.1rem",fontWeight:'400'}}>{quantity}</p>
                                        <motion.button onClick={handleIncreaseQty} style={{padding:"10px 15px",fontSize:"1.050rem",backgroundColor:"black",color:"white",outline:"none",border:'none',borderRadius:"8px"}}>+</motion.button>
                                    </MotionConfig>

                                </Stack>

                                {/* add to cart */}
                                {
                                    isProductAlreadyInCart?
                                    <button style={{padding:"10px 15px",fontSize:"1.050rem",backgroundColor:"black",color:"white",outline:"none",border:'none',borderRadius:"8px"}}>В корзине</button>
                                    :<motion.button whileHover={{scale:1.050}} whileTap={{scale:1}} onClick={handleAddToCart} style={{padding:"10px 15px",fontSize:"1.050rem",backgroundColor:"black",color:"white",outline:"none",border:'none',borderRadius:"8px"}}>Добавить в корзину</motion.button>
                                }

                                {/* wishlist */}
                                <motion.div style={{border:"1px solid grayText",borderRadius:"4px",display:"flex",justifyContent:"center",alignItems:"center"}}>
                                    <Checkbox checked={isProductAlreadyinWishlist} onChange={(e)=>handleAddRemoveFromWishlist(e)} icon={<FavoriteBorder />} checkedIcon={<Favorite sx={{color:'red'}} />} />
                                </motion.div>


                            </Stack>

                        </Stack>

                        }


                        {/* product perks */}
                        <Stack mt={3} sx={{justifyContent:"center",alignItems:'center',border:"1px grayText solid",borderRadius:"7px"}}>

                            <Stack p={2} flexDirection={'row'} alignItems={"center"} columnGap={'1rem'} width={'100%'} justifyContent={'flex-sart'}>
                                <Box>
                                    <LocalShippingOutlinedIcon/>
                                </Box>
                                <Stack>
                                    <Typography>Бесплатная доставка</Typography>
                                    <Typography>Укажите свой почтовый адрес, чтобы узнать, доступна ли доставка</Typography>
                                </Stack>
                            </Stack>
                            <hr style={{width:"100%"}} />
                            <Stack p={2} flexDirection={'row'} alignItems={"center"} width={'100%'} columnGap={'1rem'} justifyContent={'flex-start'}>
                                <Box>
                                    <CachedOutlinedIcon/>
                                </Box>
                                <Stack>
                                    <Typography>Возврат</Typography>
                                    <Typography>Бесплатный возврат в течение 30 дней</Typography>
                                </Stack>
                            </Stack>

                        </Stack>

                    </Stack>

                </Stack>

                {/* reviews */}
                <Stack width={is1420?"auto":'88rem'} p={is480?2:0}>
                    <Reviews productId={id} averageRating={averageRating}/>
                </Stack>

            </Stack>
        }

    </Stack>
    }
    </>

  )
}