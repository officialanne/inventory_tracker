'use client'
import { useState, useEffect } from "react"
import { firestore, storage } from '@/firebase'
import { Box, Modal, Typography, Stack, TextField, Button } from "@mui/material"
import { collection, deleteDoc, doc, getDocs, getDoc, query, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

const searchBarStyle = {
  padding: '2px 4px',
  display: 'flex',
  alignItems: 'center',
  width: 400,
  backgroundColor: '#1976d2',
  color: 'white',
  borderRadius: 2,
}

const inputStyle = {
  marginLeft: 1,
  flex: 1,
  color: 'white',
  '& input': {
    color: 'white',
  },
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [imageUrl, setImageUrl] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data()
      })
    })
    setInventory(inventoryList)
  }
  
  const addItem = async () => {
    const docRef = doc(collection(firestore, 'inventory'), itemName)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()){
      const {quantity} = docSnap.data()
      await setDoc(docRef, {quantity: quantity + 1, imageUrl})
    } else {
      await setDoc(docRef, {quantity: 1, imageUrl})
    }

    await updateInventory()
    setItemName('')
    setImageUrl('')
    setSelectedFile(null)
    handleClose()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()){
      const {quantity} = docSnap.data()
      if (quantity === 1){
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, {quantity: quantity - 1})
      }
    }
    await updateInventory()
  }

  const handleSearch = (event) => {
    setSearchQuery(event.target.value)
  }

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0])
  }

  const handleFileUpload = async () => {
    if (selectedFile) {
      const storageRef = ref(storage, `images/${selectedFile.name}`)
      await uploadBytes(storageRef, selectedFile)
      const url = await getDownloadURL(storageRef)
      setImageUrl(url)
    }
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Box 
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Modal 
        open={open} 
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      > 
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="contained"
              component="label"
            >
              Upload Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {selectedFile && <Typography>Selected file: {selectedFile.name}</Typography>}
            <Button
              variant="contained"
              onClick={handleFileUpload}
              disabled={!selectedFile}
            >
              Upload Image
            </Button>
            {imageUrl && <img src={imageUrl} alt="Uploaded" width="100" height="100" />}
            <Button
              variant="outlined"
              onClick={addItem}
              disabled={!itemName || !imageUrl}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      
      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>

      <Box sx={searchBarStyle}>
        <TextField
          placeholder="Search items..."
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{ style: inputStyle }}
        />
      </Box>

      <Box border={'1px solid #333'}>
        <Box
          width="800px"
          height="100px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items 
          </Typography>
        </Box>

        <Stack width="800px" height="300px" spacing={2} overflow={"auto"}>
          {filteredInventory.map(({name, quantity, imageUrl}) => (
            <Box 
              key={name}
              width="100%"
              minHeight="150px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              paddingX={5}
            >
              <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                Quantity: {quantity}
              </Typography>
              {imageUrl && <img src={imageUrl} alt={name} width="100" height="100" />}
              <Button variant="contained" onClick={() => removeItem(name)}>
                Remove
              </Button>
              <Button variant="contained" onClick={() => addItem(name)}>
                Add
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}
