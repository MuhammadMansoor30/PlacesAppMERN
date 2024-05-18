from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pytest

def setup_module(module):
    global driver
    driver = webdriver.Chrome()
    driver.implicitly_wait(10)

def teardown_module(module):
    driver.quit()

def test_auth_login():
    driver.get("http://52.91.53.184:3000/auth") 

    email_input = driver.find_element(By.ID, "email")
    password_input = driver.find_element(By.ID, "password")
    submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")

    email_input.send_keys("assignment3@gmail.com")
    password_input.send_keys("password1234")
    submit_button.click()

    # Waiting for login to complete
    WebDriverWait(driver, 10).until(
        EC.url_changes("http://52.91.53.184:3000/auth")
    )

    # Checking if login was successful 
    assert "dashboard" in driver.current_url

def test_add_new_place():
    driver.get("http://52.91.53.184:3000/places/new")  

    title_input = driver.find_element(By.ID, "title")
    description_input = driver.find_element(By.ID, "description")
    address_input = driver.find_element(By.ID, "address")
    image_upload = driver.find_element(By.ID, "image")   
    submit_button = driver.find_element(By.XPATH, "//button[@type='submit']")

    title_input.send_keys("Test Place")
    description_input.send_keys("A nice place to visit in the world.")
    address_input.send_keys("123 Comsats Islamabad")
    image_upload.send_keys("/images/place.jpg")  

    submit_button.click()

    # Waiting for place addition to complete
    WebDriverWait(driver, 10).until(
        EC.url_changes("http://52.91.53.184:3000/places/new")
    )

    # Checking if the new place was added 
    assert "places" in driver.current_url
